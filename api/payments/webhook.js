export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { createServerSupabase } = await import('../auth/verify.js');
    const supabase = createServerSupabase();

    const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    let event = null;

    try {
        if (stripeSecret && stripeKey) {
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' });

            const sig = req.headers['stripe-signature'];
            const buf = Buffer.from(await new Promise((r, rej) => {
                let data = [];
                req.on('data', chunk => data.push(chunk));
                req.on('end', () => r(Buffer.concat(data)));
                req.on('error', rej);
            }));

            try {
                event = stripe.webhooks.constructEvent(buf, sig, stripeSecret);
            } catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        } else {
            // No Stripe configured: accept the JSON body
            event = req.body;
        }

        console.log('Payment webhook event received:', event.type || 'unknown');

        // Handle specific events
        const type = event.type || (event?.data?.object?.type) || 'unknown';
        if (type === 'payment_intent.succeeded' || (event?.type === 'payment_intent.succeeded')) {
            const pi = event.data.object;
            const stripeId = pi.id;
            // Update payments record
            try {
                await supabase.from('payments').update({ status: 'succeeded' }).eq('stripe_id', stripeId);
            } catch (e) {
                console.warn('Failed updating payment record:', e.message || e);
            }
        }

        if (type === 'checkout.session.completed' || event?.type === 'checkout.session.completed') {
            const session = event.data.object;
            const sessionId = session.id;
            const metadata = session.metadata || {};

            // Update payments record
            try {
                await supabase.from('payments').update({ status: 'succeeded' }).eq('stripe_id', sessionId);
            } catch (e) {
                console.warn('Failed updating payment record for session:', e.message || e);
            }

            // Upgrade user subscription to 'pro' if userId metadata present
            if (metadata.userId) {
                try {
                    await supabase.from('users').update({ subscription_tier: 'pro' }).eq('id', metadata.userId);
                } catch (e) {
                    console.warn('Failed updating user subscription:', e.message || e);
                }
            }
        }

        // TODO: handle subscription creation/tier update when using Checkout / Subscriptions

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
}
