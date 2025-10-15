import React, { useState } from 'react';
// This component is an example showing how to integrate Stripe.js on the frontend.
// It is not wired by default. To use it:
// 1. npm install @stripe/stripe-js
// 2. Provide a publishable key in env and a server endpoint that returns a PaymentIntent client_secret.

import { loadStripe } from '@stripe/stripe-js';

const StripePaymentProcessor = ({ amount, userId, funnelId, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            // Request a client secret from the server (api/payments/create)
            const r = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, userId, funnelId })
            });
            const body = await r.json();
            if (!body || !body.success) throw new Error(body?.error || 'Failed to create payment');

            // If Stripe is used, body.session.clientSecret should contain client_secret
            const clientSecret = body?.session?.clientSecret;
            if (!clientSecret) throw new Error('Missing client secret');

            // Load Stripe.js with your publishable key (set in environment)
            const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || window.__STRIPE_PUBLISHABLE__);
            if (!stripe) throw new Error('Stripe.js failed to load');

            const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    // In a real UI you'd collect card info via Elements
                }
            });

            if (stripeError) throw stripeError;

            onSuccess && onSuccess();
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleCheckout} disabled={loading}>
                {loading ? 'Processing...' : `Pay $${amount}`}
            </button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default StripePaymentProcessor;
