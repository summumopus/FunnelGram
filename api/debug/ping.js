import { wrap } from '../../api/debugWrapper.js';

async function handler(req, res) {
    const env = {
        has_supabase_url: !!process.env.SUPABASE_URL,
        has_supabase_service_key: !!process.env.SUPABASE_SERVICE_KEY,
        has_telegram_bot_token: !!process.env.TELEGRAM_BOT_TOKEN,
        has_stripe_secret: !!process.env.STRIPE_SECRET_KEY,
        node_env: process.env.NODE_ENV || null
    };

    return res.status(200).json({ ok: true, env });
}

export default wrap(handler);
