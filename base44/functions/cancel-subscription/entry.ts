import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { subscription_id } = body;

    if (!subscription_id) {
      return Response.json({ error: 'subscription_id requis' }, { status: 400 });
    }

    const sub = await base44.asServiceRole.entities.Subscription.get(subscription_id);
    if (!sub) {
      return Response.json({ error: 'Abonnement introuvable' }, { status: 404 });
    }

    if (!sub.wix_subscription_id) {
      return Response.json({ error: "Aucun prélèvement automatique actif" }, { status: 400 });
    }

    const cancelUrl = `https://www.wixapis.com/payments/base44/v1/subscriptions/${sub.wix_subscription_id}/cancel`;

    // Try soft cancellation first (keeps access until end of cycle)
    let response = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Deno.env.get('WIX_PAYMENTS_API_KEY'),
        'wix-site-id': Deno.env.get('WIX_PAYMENTS_SITE_ID'),
      },
      body: JSON.stringify({
        subscription_id: sub.wix_subscription_id,
        immediate: false,
      }),
    });

    // If soft cancel fails (e.g. auto-renew already off), force immediate cancel
    if (!response.ok) {
      response = await fetch(cancelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Deno.env.get('WIX_PAYMENTS_API_KEY'),
          'wix-site-id': Deno.env.get('WIX_PAYMENTS_SITE_ID'),
        },
        body: JSON.stringify({
          subscription_id: sub.wix_subscription_id,
          immediate: true,
        }),
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Wix cancel error', JSON.stringify(errData));
      return Response.json({ error: 'Échec de la désactivation du prélèvement' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Subscription.update(subscription_id, {
      autopay_status: 'none',
      wix_subscription_id: '',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('cancel-subscription error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});