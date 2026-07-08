import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const GMAIL_CONNECTOR_ID = "6a4def8be153a0a9d486583b";

function base64UrlToUint8Array(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeBase64Url(str) {
  return new TextDecoder().decode(base64UrlToUint8Array(str));
}

function getHeader(message, name) {
  const headers = message.payload?.headers || [];
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function getBodyText(message) {
  const parts = message.payload?.parts || [];
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64Url(part.body.data);
    if (part.parts) {
      for (const sub of part.parts) {
        if (sub.mimeType === 'text/plain' && sub.body?.data) return decodeBase64Url(sub.body.data);
      }
    }
  }
  for (const part of parts) {
    if (part.mimeType === 'text/html' && part.body?.data) return decodeBase64Url(part.body.data).replace(/<[^>]*>/g, ' ');
  }
  if (message.payload?.body?.data) return decodeBase64Url(message.payload.body.data);
  return '';
}

function getPdfAttachments(message) {
  const parts = message.payload?.parts || [];
  return parts.filter(p => p.mimeType === 'application/pdf' && p.body?.attachmentId);
}

function addOneDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function parseEmailDate(dateStr) {
  try { return new Date(dateStr).toISOString().split('T')[0]; }
  catch { return new Date().toISOString().split('T')[0]; }
}

const VALID_CATEGORIES = ['Logiciel/SaaS', 'Hébergement', 'Abonnement', 'Assurance', 'Matériel', 'Autre'];

function buildLLMPrompt(subject, date, bodyText) {
  return `Tu es un assistant d'extraction de paiements. Analyse cet email et extrais les informations de paiement.

RÈGLES STRICTES :
- N'extrais QUE les paiements dont le montant est CLAIREMENT indiqué dans l'email.
- N'invente JAMAIS un montant. Si le montant n'est pas explicitement écrit, mets "skip": true pour cet item.
- Retourne un objet JSON avec un tableau "items".
- Chaque item : date (AAAA-MM-JJ), vendor (marchand), amount (nombre), currency (code 3 lettres), category, subject, skip (booléen).
- Catégories : "Logiciel/SaaS", "Hébergement", "Abonnement", "Assurance", "Matériel", "Autre"
- Si l'email ne parle pas d'un paiement/facture/reçu, retourne un tableau items vide.
- La date = date de paiement si disponible, sinon date de l'email.

Objet : ${subject}
Date email : ${date}
Corps :
${bodyText.substring(0, 3000)}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { periodStart, periodEnd, checkOnly } = body;

    // Check Gmail connection
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(GMAIL_CONNECTOR_ID);
      accessToken = conn.accessToken;
    } catch (e) {
      if (checkOnly) return Response.json({ connected: false });
      return Response.json({ error: 'Gmail non connecté. Veuillez connecter votre compte Gmail.' }, { status: 403 });
    }

    if (checkOnly) return Response.json({ connected: true });
    if (!periodStart || !periodEnd) return Response.json({ error: 'Période manquante' }, { status: 400 });

    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Build Gmail search query
    const afterDate = periodStart.replace(/-/g, '/');
    const beforeDate = addOneDay(periodEnd).replace(/-/g, '/');
    const keywords = 'facture OR reçu OR paiement OR abonnement OR prélèvement OR factuur OR betaling OR bestelling OR invoice OR receipt OR payment OR subscription OR charged OR renewed';
    const query = `after:${afterDate} before:${beforeDate} (${keywords})`;

    const searchRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=30`,
      { headers: authHeader }
    );
    if (!searchRes.ok) {
      console.error('Gmail search error:', await searchRes.text());
      return Response.json({ error: 'Erreur lors de la recherche Gmail' }, { status: 500 });
    }
    const searchData = await searchRes.json();
    const messageIds = searchData.messages || [];

    const lineItems = [];

    for (const msgRef of messageIds) {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
          { headers: authHeader }
        );
        if (!msgRes.ok) continue;
        const message = await msgRes.json();

        const subject = getHeader(message, 'Subject');
        const date = parseEmailDate(getHeader(message, 'Date'));
        const pdfParts = getPdfAttachments(message);

        if (pdfParts.length > 0) {
          for (const part of pdfParts) {
            try {
              const attRes = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}/attachments/${part.body.attachmentId}`,
                { headers: authHeader }
              );
              if (!attRes.ok) continue;
              const attData = await attRes.json();
              const bytes = base64UrlToUint8Array(attData.data);
              const blob = new Blob([bytes], { type: 'application/pdf' });
              const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });

              const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
                file_url,
                json_schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string" },
                          vendor: { type: "string" },
                          amount: { type: "number" },
                          currency: { type: "string" }
                        }
                      }
                    }
                  }
                }
              });

              let extractedItems = [];
              if (extracted.status === 'success' && extracted.output) {
                extractedItems = Array.isArray(extracted.output) ? extracted.output : (extracted.output.items || []);
              }

              for (const item of extractedItems) {
                if (item.amount != null && item.vendor) {
                  lineItems.push({
                    date: item.date || date,
                    vendor: item.vendor,
                    amount: parseFloat(item.amount),
                    currency: (item.currency || 'EUR').toUpperCase(),
                    category: 'Autre',
                    subject, source_email_id: msgRef.id,
                    attachment: file_url, verified: false
                  });
                }
              }
            } catch (attErr) {
              console.log(`Attachment error ${msgRef.id}: ${attErr.message}`);
            }
          }
        } else {
          const bodyText = getBodyText(message);
          if (!bodyText || bodyText.length < 20) continue;

          const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: buildLLMPrompt(subject, date, bodyText),
            response_json_schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      vendor: { type: "string" },
                      amount: { type: "number" },
                      currency: { type: "string" },
                      category: { type: "string" },
                      subject: { type: "string" },
                      skip: { type: "boolean" }
                    }
                  }
                }
              }
            }
          });

          const items = llmRes.items || [];
          for (const item of items) {
            if (item.skip || item.amount == null || !item.vendor) continue;
            lineItems.push({
              date: item.date || date,
              vendor: item.vendor,
              amount: parseFloat(item.amount),
              currency: (item.currency || 'EUR').toUpperCase(),
              category: VALID_CATEGORIES.includes(item.category) ? item.category : 'Autre',
              subject, source_email_id: msgRef.id, verified: false
            });
          }
        }
      } catch (msgErr) {
        console.log(`Message error ${msgRef.id}: ${msgErr.message}`);
      }
    }

    // Create or reuse Statement
    let existing = await base44.entities.Statement.filter({ period_start: periodStart, period_end: periodEnd });
    let statement = existing[0];
    if (statement) {
      await base44.entities.LineItem.deleteMany({ statement: statement.id });
    } else {
      statement = await base44.entities.Statement.create({
        period_start: periodStart, period_end: periodEnd,
        generated_at: new Date().toISOString(),
        status: 'brouillon', totals_by_currency: {}
      });
    }

    if (lineItems.length > 0) {
      await base44.entities.LineItem.bulkCreate(lineItems.map(item => ({ ...item, statement: statement.id })));
    }

    const totals = {};
    for (const item of lineItems) {
      const c = item.currency || 'EUR';
      totals[c] = (totals[c] || 0) + item.amount;
    }
    await base44.entities.Statement.update(statement.id, { totals_by_currency: totals });

    return Response.json({ statement_id: statement.id, line_count: lineItems.length, totals });
  } catch (error) {
    console.error('generateStatement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});