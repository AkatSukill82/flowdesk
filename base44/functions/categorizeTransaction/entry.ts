import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    // Handle both entity automation payload and direct call
    const transaction_id = body?.event?.entity_id || body?.transaction_id;
    const label = body?.data?.label || body?.label;

    if (!transaction_id || !label) {
      return Response.json({ error: 'Missing transaction_id or label' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a financial transaction categorizer. Based on the transaction label below, determine the best category.

Transaction label: "${label}"

Categories:
- income: incoming money, payments received, revenue
- salary: wage payments, payroll
- subscription: recurring software/service payments (SaaS, tools, streaming)
- tax: government taxes, VAT, social charges
- expense: general business expenses, purchases, supplies
- transfer: money transfers between accounts

Return ONLY the category name, nothing else.`,
      response_json_schema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['income', 'salary', 'subscription', 'tax', 'expense', 'transfer'],
          },
        },
      },
    });

    const category = result?.category || 'expense';

    await base44.asServiceRole.entities.Transaction.update(transaction_id, { category });

    return Response.json({ success: true, category });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});