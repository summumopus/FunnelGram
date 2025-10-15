import { createServerSupabase, verifyInitData } from '../auth/verify.js';

const supabase = createServerSupabase();

export default async function handler(req, res) {
    // Accept an optional Telegram initData in header 'x-tg-initdata' for server-side verification
    const initData = req.headers['x-tg-initdata'] || req.body?.initData || '';
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // verify when provided; in production require verification
    const verified = verifyInitData(initData, BOT_TOKEN);
    const isDevFallback = !verified && process.env.NODE_ENV !== 'production';

    if (!verified && !isDevFallback) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid Telegram initData' });
    }

    if (req.method === 'POST') {
        try {
            const { userId, name, funnelType } = req.body;

            if (!userId) return res.status(400).json({ error: 'userId is required' });

            const { data: funnel, error } = await supabase
                .from('funnels')
                .insert([
                    {
                        user_id: userId,
                        name: name || 'New Funnel',
                        funnel_type: funnelType || 'lead-magnet',
                        status: 'draft',
                        leads: 0,
                        conversions: 0,
                        revenue: 0
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            res.status(200).json({ funnel, success: true });
        } catch (error) {
            console.error('Create funnel error:', error);
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { funnelId } = req.body;

            if (!funnelId) return res.status(400).json({ error: 'funnelId is required' });

            const { error } = await supabase
                .from('funnels')
                .delete()
                .eq('id', funnelId);

            if (error) throw error;

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Delete funnel error:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}