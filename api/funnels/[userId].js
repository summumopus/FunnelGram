import { createServerSupabase, verifyInitData } from '../auth/verify.js';

const supabase = createServerSupabase();

export default async function handler(req, res) {
    const { userId } = req.query;

    // If Supabase isn't configured, return 503 so the function doesn't crash.
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        return res.status(503).json({ error: 'Service unavailable: supabase not configured' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Optionally verify Telegram initData passed in header for extra security
    const initData = req.headers['x-tg-initdata'] || '';
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const verified = verifyInitData(initData, BOT_TOKEN);
    const isDevFallback = !verified && process.env.NODE_ENV !== 'production';
    if (!verified && !isDevFallback) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid Telegram initData' });
    }

    try {
        const { data: funnels, error } = await supabase
            .from('funnels')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ funnels: funnels || [] });
    } catch (error) {
        console.error('Get funnels error:', error);
        res.status(500).json({ error: error.message });
    }
}