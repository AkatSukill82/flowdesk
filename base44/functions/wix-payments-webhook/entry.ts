import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();

    // Step 1: Verify JWT signature — fail closed if key missing or verification fails
    const WEBHOOK_PUBLIC_KEY = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!WEBHOOK_PUBLIC_KEY) {
      return Response.json({ error: 'Missing webhook public key' }, { status: 500 });
    }

    let rawPayload;
    try {
      rawPayload = jwt.verify(rawBody, WEBHOOK_PUBLIC_KEY, { algorithms: ['RS256'] });
    } catch (e) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Step 2: Parse double-nested JSON
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      // Match the subscription by the stored checkout id
      const matches = await base44.asServiceRole.entities.Subscription.filter({
        wix_checkout_id: checkoutId,
      });

      for (const sub of matches) {
        // Store the subscription id from line items
        let wixSubId = null;
        for (const lineItem of order.lineItems) {
          if (lineItem.subscriptionInfo) {
            wixSubId = lineItem.subscriptionInfo.id;
            break;
          }
        }

        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          wix_subscription_id: wixSubId,
          autopay_status: 'active',
        });

        // Record the payment as a paid transaction
        await base44.asServiceRole.entities.Transaction.create({
          label: `${sub.name} — prélèvement automatique`,
          amount: -Math.abs(sub.amount),
          category: 'subscription',
          payment_status: 'paid',
          source: 'webhook',
          date: new Date().toISOString().split('T')[0],
          created_by_id: sub.created_by_id,
        });
      }
    } else if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;

      const matches = await base44.asServiceRole.entities.Subscription.filter({
        wix_subscription_id: subscriptionId,
      });

      for (const sub of matches) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          autopay_status: 'none',
          status: 'cancelled',
        });
      }
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('wix-payments-webhook error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});