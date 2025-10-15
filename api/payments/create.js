import { wrap } from '../../api/debugWrapper.js';

async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { createServerSupabase } = await import('../auth/verify.js');
    const supabase = createServerSupabase();

    const { amount, userId, funnelId } = req.body || {};
    if (!amount || !userId) return res.status(400).json({ error: 'Missing amount or userId' });

    // If STRIPE_SECRET_KEY is configured, create a real PaymentIntent/Checkout session
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        // Mock response
        const mockSession = {
            id: 'mock_session_' + Date.now(),
            clientSecret: 'mock_client_secret_' + Math.random().toString(36).slice(2),
            amount,
            currency: 'usd'
        };
        return res.status(200).json({ session: mockSession, success: true, mock: true });
    }

    try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' });

        // Create a Checkout Session for a one-time payment
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'FunnelGram Pro' },
                        unit_amount: Math.round(Number(amount) * 100)
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: process.env.STRIPE_SUCCESS_URL || 'https://example.com/success',
            cancel_url: process.env.STRIPE_CANCEL_URL || 'https://example.com/cancel',
            metadata: {
                userId: String(userId),
                funnelId: funnelId || ''
            }
        });

        // Optionally record a pending payment in Supabase if configured
        try {
            if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
                await supabase.from('payments').insert([
                    {
                        stripe_id: session.id,
                        user_id: userId,
                        funnel_id: funnelId || null,
                        amount: amount,
                        currency: 'usd',
                        status: 'created',
                        created_at: new Date().toISOString()
                    }
                ]);
            } else {
                console.warn('Supabase not configured; skipping payment record insert');
            }
        } catch (e) {
            console.warn('Failed to record payment in Supabase:', e.message || e);
        }

        return res.status(200).json({ session: { id: session.id, url: session.url }, success: true });
    } catch (error) {
        console.error('Create payment error:', error);
        return res.status(500).json({ error: 'Failed to create payment' });
    }
}

export default wrap(handler);
