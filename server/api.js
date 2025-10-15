import express from 'express';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all templates
router.get('/templates', async (req, res) => {
    try {
        const { data: templates, error } = await supabase
            .from('templates')
            .select('*')
            .order('category');

        if (error) throw error;
        res.json({ templates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create funnel from template
router.post('/funnels/from-template', async (req, res) => {
    try {
        const { userId, templateId, funnelName } = req.body;

        // Get template
        const { data: template, error: templateError } = await supabase
            .from('templates')
            .select('*')
            .eq('id', templateId)
            .single();

        if (templateError) throw templateError;

        // Create funnel
        const { data: funnel, error: funnelError } = await supabase
            .from('funnels')
            .insert([{
                user_id: userId,
                name: funnelName,
                funnel_type: template.category,
                status: 'draft'
            }])
            .select()
            .single();

        if (funnelError) throw funnelError;

        // Create pages from template
        const templateData = template.template_data;
        for (const pageData of templateData.pages) {
            await supabase
                .from('funnel_pages')
                .insert([{
                    funnel_id: funnel.id,
                    title: pageData.title,
                    slug: pageData.title.toLowerCase().replace(/\s+/g, '-'),
                    elements: pageData.elements,
                    page_order: 0
                }]);
        }

        res.json({ funnel, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update funnel pages
router.put('/funnels/:funnelId/pages', async (req, res) => {
    try {
        const { funnelId } = req.params;
        const { pages } = req.body;

        // Delete existing pages
        await supabase
            .from('funnel_pages')
            .delete()
            .eq('funnel_id', funnelId);

        // Insert updated pages
        for (const page of pages) {
            await supabase
                .from('funnel_pages')
                .insert([{
                    funnel_id: funnelId,
                    title: page.title,
                    slug: page.slug,
                    elements: page.elements,
                    page_order: page.page_order
                }]);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get funnel pages
router.get('/funnels/:funnelId/pages', async (req, res) => {
    try {
        const { funnelId } = req.params;

        const { data: pages, error } = await supabase
            .from('funnel_pages')
            .select('*')
            .eq('funnel_id', funnelId)
            .order('page_order');

        if (error) throw error;
        res.json({ pages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Real Stripe payment integration
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', funnelId, userId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                funnel_id: funnelId,
                user_id: userId
            }
        });

        // Store payment record
        await supabase
            .from('payments')
            .insert([{
                user_id: userId,
                funnel_id: funnelId,
                amount: amount,
                status: 'pending',
                stripe_payment_intent_id: paymentIntent.id
            }]);

        res.json({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook for Stripe payments
router.post('/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            // Update payment status in database
            await supabase
                .from('payments')
                .update({ status: 'completed' })
                .eq('stripe_payment_intent_id', paymentIntent.id);

            // Update funnel revenue
            const { data: payment } = await supabase
                .from('payments')
                .select('funnel_id, amount')
                .eq('stripe_payment_intent_id', paymentIntent.id)
                .single();

            if (payment) {
                await supabase
                    .from('funnels')
                    .update({
                        revenue: supabase.raw('revenue + ?', [payment.amount]),
                        conversions: supabase.raw('conversions + 1')
                    })
                    .eq('id', payment.funnel_id);
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

export default router;