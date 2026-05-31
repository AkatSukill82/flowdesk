import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();
    const now = new Date();
    const alerts = [];

    for (const user of users) {
      const userId = user.id;

      // Get user's accounts
      const accounts = await base44.asServiceRole.entities.Account.filter({ created_by_id: userId });

      // Get user's transactions
      const transactions = await base44.asServiceRole.entities.Transaction.filter({ created_by_id: userId });

      // Get user's subscriptions
      const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: userId });

      // Get total balance
      const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

      // --- Check 1: Low balance ---
      for (const account of accounts) {
        if ((account.balance || 0) < 200) {
          alerts.push({
            type: 'low_balance',
            message: `Attention — Le solde de "${account.name}" est bas (${Math.round(account.balance || 0)} €). Pense à le réapprovisionner.`,
            is_read: false,
            triggered_at: now.toISOString(),
            created_by_id: userId,
          });
        }
      }

      // --- Check 2: Renewal soon with low balance ---
      const activeSubs = subscriptions.filter((s) => s.status === 'active');
      for (const sub of activeSubs) {
        if (!sub.next_renewal) continue;
        const renewal = new Date(sub.next_renewal);
        const daysUntil = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 5 && daysUntil >= 0 && totalBalance < 3 * sub.amount) {
          alerts.push({
            type: 'renewal_soon',
            message: `Attention — ${sub.name} (${sub.amount} €) renouvelle dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''} et ton solde est bas.`,
            is_read: false,
            triggered_at: now.toISOString(),
            created_by_id: userId,
          });
        }
      }

      // --- Check 3: Spending spike ---
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthExpenses = Math.abs(
        transactions
          .filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.amount < 0;
          })
          .reduce((s, t) => s + t.amount, 0)
      );

      const last3MonthsExpenses = [];
      for (let i = 1; i <= 3; i++) {
        const m = new Date(currentYear, currentMonth - i, 1);
        const monthExp = Math.abs(
          transactions
            .filter((t) => {
              const d = new Date(t.date);
              return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() && t.amount < 0;
            })
            .reduce((s, t) => s + t.amount, 0)
        );
        last3MonthsExpenses.push(monthExp);
      }

      const avgExpenses = last3MonthsExpenses.length > 0
        ? last3MonthsExpenses.reduce((s, e) => s + e, 0) / last3MonthsExpenses.length
        : 0;

      if (avgExpenses > 0 && currentMonthExpenses > avgExpenses * 1.2) {
        const diff = Math.round(currentMonthExpenses - avgExpenses);
        alerts.push({
          type: 'spending_spike',
          message: `Tu as dépensé ${diff} € de plus ce mois-ci par rapport à ta moyenne.`,
          is_read: false,
          triggered_at: now.toISOString(),
          created_by_id: userId,
        });
      }

      // --- Check 4: Forecast warning ---
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

      const forecast30 = totalBalance + avgNet;
      if (forecast30 < 500) {
        alerts.push({
          type: 'forecast_warning',
          message: `À ce rythme, tu seras à ${Math.round(forecast30)} € dans 30 jours.`,
          is_read: false,
          triggered_at: now.toISOString(),
          created_by_id: userId,
        });
      }
    }

    // Bulk create alerts
    if (alerts.length > 0) {
      await base44.asServiceRole.entities.Alert.bulkCreate(alerts);
    }

    return Response.json({ success: true, alerts_created: alerts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});