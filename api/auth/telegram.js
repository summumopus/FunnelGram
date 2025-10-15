import { createServerSupabase, verifyInitData } from './verify.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { createServerSupabase } = await import('./verify.js');
    const supabase = createServerSupabase();

    try {
        const { initData } = req.body || {};
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        const verified = verifyInitData(initData, BOT_TOKEN);
        let userData = null;

        if (verified) {
            try {
                // The 'user' field is JSON in the initData
                userData = verified.user ? JSON.parse(verified.user) : null;
            } catch (e) {
                userData = null;
            }
        }

        // In development, allow a demo fallback so the app can run locally without Telegram
        const isDevFallback = !verified && process.env.NODE_ENV !== 'production';
        if (!userData && isDevFallback) {
            console.warn('Using DEV fallback user because initData verification failed or not provided.');
            userData = {
                id: Math.floor(Math.random() * 1000000),
                first_name: 'Dev',
                last_name: 'User',
                username: 'dev_user'
            };
        }

        if (!userData) {
            return res.status(401).json({ error: 'Invalid or missing Telegram initData' });
        }

        // Upsert user into Supabase (server-side)
        const payload = {
            telegram_id: userData.id,
            telegram_username: userData.username || null,
            first_name: userData.first_name || null,
            last_name: userData.last_name || null,
            updated_at: new Date().toISOString()
        };

        const { data: user, error } = await supabase
            .from('users')
            .upsert(payload, { onConflict: 'telegram_id' })
            .select()
            .single();

        if (error) {
            console.error('Supabase upsert error:', error);
            return res.status(500).json({ error: 'Failed to save user' });
        }

        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
}