import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = '6a1b8ef08e6292baf607ea7d';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const { spreadsheetId, sheetName, range } = await req.json();
    if (!spreadsheetId) return Response.json({ error: 'spreadsheetId requis' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const sheetRange = sheetName ? `${sheetName}!${range || 'A1:Z1000'}` : (range || 'A1:Z1000');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json();
      return Response.json({ error: err.error?.message || 'Erreur Google Sheets' }, { status: res.status });
    }

    const data = await res.json();
    const rows = data.values || [];
    if (rows.length < 2) return Response.json({ rows: [] });

    const headers = rows[0].map((h) => h.trim().toLowerCase());

    const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('datum'));
    const labelIdx = headers.findIndex((h) =>
      h.includes('label') || h.includes('libellé') || h.includes('libelle') ||
      h.includes('description') || h.includes('communication')
    );
    const amountIdx = headers.findIndex((h) =>
      h.includes('amount') || h.includes('montant') || h.includes('bedrag')
    );
    const debitIdx = headers.findIndex((h) => h.includes('debit') || h.includes('débit'));
    const creditIdx = headers.findIndex((h) => h.includes('credit') || h.includes('crédit'));

    const transactions = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols || cols.length === 0) continue;

      let amount = 0;
      if (amountIdx >= 0) {
        amount = parseFloat(String(cols[amountIdx] || '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
      } else if (debitIdx >= 0 && creditIdx >= 0) {
        const debit = parseFloat(String(cols[debitIdx] || '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
        const credit = parseFloat(String(cols[creditIdx] || '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
        amount = credit > 0 ? credit : -debit;
      }

      const dateStr = dateIdx >= 0 ? (cols[dateIdx] || '') : '';
      let parsedDate = '';
      if (dateStr) {
        const parts = String(dateStr).split(/[/.\-]/);
        if (parts.length === 3) {
          const [a, b, c] = parts;
          parsedDate = a.length === 4
            ? `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`
            : `${c}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`;
        }
      }

      transactions.push({
        date: parsedDate || new Date().toISOString().split('T')[0],
        label: labelIdx >= 0 ? (cols[labelIdx] || 'Transaction importée') : (cols[1] || 'Transaction importée'),
        amount,
        category: amount >= 0 ? 'income' : 'expense',
        source: 'manual',
      });
    }

    return Response.json({ rows: transactions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});