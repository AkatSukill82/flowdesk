import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.list();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let emailsSent = 0;

    for (const user of users) {
      const userId = user.id;

      // Get accounts and balance
      const accounts = await base44.asServiceRole.entities.Account.filter({ created_by_id: userId });
      const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

      // Get this week's transactions
      const transactions = await base44.asServiceRole.entities.Transaction.filter({ created_by_id: userId });
      const weekTxns = transactions.filter((t) => new Date(t.date) >= weekAgo);

      const weekIncome = weekTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const weekExpenses = Math.abs(weekTxns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));

      // Get unread alerts
      const alerts = await base44.asServiceRole.entities.Alert.filter({
        created_by_id: userId,
        is_read: false,
      });
      const topAlerts = alerts.slice(0, 3);

      // Calculate forecast
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const last3MonthsNets = [];
      for (let i = 1; i <= 3; i++) {
        const m = new Date(currentYear, currentMonth - i, 1);
        const monthNet = transactions
          .filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
          })
          .reduce((s, t) => s + t.amount, 0);
        last3MonthsNets.push(monthNet);
      }
      const avgNet = last3MonthsNets.length > 0
        ? last3MonthsNets.reduce((s, n) => s + n, 0) / last3MonthsNets.length
        : 0;
      const forecast = totalBalance + avgNet;

      const alertsList = topAlerts.length > 0
        ? topAlerts.map((a) => `⚠️ ${a.message}`).join('<br>')
        : '✅ Aucune alerte active — tout va bien !';

      const emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #1D9E75; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">📊 Ton résumé hebdomadaire</h1>
          </div>
          <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #6b7280; margin: 0 0 16px;">Bonjour ${user.full_name || 'ami'}, voici ta semaine en un coup d'œil.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Solde total</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${Math.round(totalBalance)} €</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Entrées cette semaine</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1D9E75; font-size: 14px;">+${Math.round(weekIncome)} €</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Sorties cette semaine</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">-${Math.round(weekExpenses)} €</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Prévision 30 jours</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${forecast >= 500 ? '#1D9E75' : '#EF9F27'}; font-size: 14px;">${Math.round(forecast)} €</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 14px; margin: 16px 0 8px; color: #374151;">Alertes</h3>
            <div style="font-size: 13px; color: #6b7280; line-height: 1.6;">${alertsList}</div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
              FlowDesk — Tes finances, enfin claires.
            </p>
          </div>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `📊 Résumé FlowDesk — Solde: ${Math.round(totalBalance)} €`,
        body: emailBody,
        from_name: 'FlowDesk',
      });

      emailsSent++;
    }

    return Response.json({ success: true, emails_sent: emailsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});