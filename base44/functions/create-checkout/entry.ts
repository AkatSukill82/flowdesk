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

    if (sub.amount < 0.50) {
      return Response.json({ error: "Le montant doit être d'au moins 0,50 €" }, { status: 400 });
    }

    const origin = req.headers.get('Origin') || req.headers.get('Referer') || 'https://flow-desk-finance.base44.app';
    const frequency = sub.cycle === 'yearly' ? 'YEAR' : 'MONTH';

    const items = [{
      name: sub.name,
      quantity: 1,
      price: String(sub.amount),
      subscriptionInfo: {
        subscriptionSettings: { frequency },
        title: sub.name,
        description: `Abonnement ${sub.cycle === 'yearly' ? 'annuel' : 'mensuel'} — ${sub.name}`,
      },
    }];

    const response = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Deno.env.get('WIX_PAYMENTS_API_KEY'),
          'wix-site-id': Deno.env.get('WIX_PAYMENTS_SITE_ID'),
        },
        body: JSON.stringify({
          cart: { items },
          callbackUrls: {
            postFlowUrl: origin,
            thankYouPageUrl: `${origin}/subscriptions`,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Wix checkout error', response.status, JSON.stringify(data));
      const msg = data?.details?.applicationError?.description || 'Erreur lors de la création du paiement';
      return Response.json({ error: msg }, { status: 400 });
    }

    // Persist the checkout id so the webhook can correlate this subscription
    await base44.asServiceRole.entities.Subscription.update(subscription_id, {
      wix_checkout_id: data.checkoutSession.id,
      autopay_status: 'pending',
    });

    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    console.error('create-checkout error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});