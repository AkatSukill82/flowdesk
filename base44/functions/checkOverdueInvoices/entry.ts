import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const threshold = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

    const users = await base44.asServiceRole.entities.User.list();
    let totalNotified = 0;

    for (const user of users) {
      const transactions = await base44.asServiceRole.entities.Transaction.filter({
        created_by_id: user.id,
        payment_status: 'pending',
      });

      const overdue = transactions.filter((t) => {
        const txDate = new Date(t.date);
        return now - txDate > threshold;
      });

      if (overdue.length === 0) continue;

      // Create an in-app alert
      const totalAmount = overdue.reduce((s, t) => s + Math.abs(t.amount), 0);
      await base44.asServiceRole.entities.Alert.create({
        type: 'custom',
        message: `⚠️ ${overdue.length} facture${overdue.length > 1 ? 's' : ''} impayée${overdue.length > 1 ? 's' : ''} depuis plus de 30 jours — total : ${Math.round(totalAmount)} €`,
        is_read: false,
        triggered_at: now.toISOString(),
        created_by_id: user.id,
      });

      // Send email alert
      const invoiceList = overdue
        .slice(0, 5)
        .map((t) => {
          const daysLate = Math.floor((now - new Date(t.date)) / (1000 * 60 * 60 * 24));
          return `• ${t.label} — ${Math.abs(t.amount)} € — en attente depuis ${daysLate} jours`;
        })
        .join('\n');

      const emailBody = `Bonjour ${user.full_name || ''},

Voici un rappel automatique de FlowDesk.

${overdue.length} facture${overdue.length > 1 ? 's' : ''} reste${overdue.length > 1 ? 'nt' : ''} impayée${overdue.length > 1 ? 's' : ''} depuis plus de 30 jours :

${invoiceList}${overdue.length > 5 ? `\n... et ${overdue.length - 5} autre(s)` : ''}

Montant total en attente : ${Math.round(totalAmount)} €

Connecte-toi à FlowDesk pour mettre à jour le statut de ces transactions.

— L'équipe FlowDesk`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `[FlowDesk] ${overdue.length} facture${overdue.length > 1 ? 's' : ''} impayée${overdue.length > 1 ? 's' : ''} depuis +30 jours`,
        body: emailBody,
      });

      // Mark them as overdue
      for (const t of overdue) {
        await base44.asServiceRole.entities.Transaction.update(t.id, { payment_status: 'overdue' });
      }

      totalNotified += overdue.length;
    }

    return Response.json({ success: true, invoices_processed: totalNotified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});