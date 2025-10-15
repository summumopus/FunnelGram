import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { initData } = req.body;

        // For demo - in production, validate Telegram WebApp data properly
        let userData;
        try {
            const params = new URLSearchParams(initData);
            const userStr = params.get('user');
            userData = userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            userData = null;
        }

        // Demo fallback
        if (!userData) {
            userData = {
                id: Math.floor(Math.random() * 1000000),
                first_name: 'Telegram',
                last_name: 'User',
                username: 'telegram_user'
            };
        }

        const { data: user, error } = await supabase
            .from('users')
            .upsert({
                telegram_id: userData.id,
                telegram_username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ user, success: true });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}