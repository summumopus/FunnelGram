import { wrap } from '../../api/debugWrapper.js';

async function handler(req, res) {
    const { id } = req.query;
    const { type } = req.query; // 'funnel' or 'user'

    // Check Supabase config
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        return res.status(503).json({ error: 'Service unavailable: supabase not configured' });
    }

    const { createServerSupabase, verifyInitData } = await import('../auth/verify.js');
    const supabase = createServerSupabase();

    // Telegram verification (optional for user requests)
    const initData = req.headers['x-tg-initdata'] || req.body?.initData || '';
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const verified = verifyInitData(initData, BOT_TOKEN);
    const isDevFallback = !verified && process.env.NODE_ENV !== 'production';
    if (!verified && !isDevFallback) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid Telegram initData' });
    }

    // Parse Telegram user if available
    let tgUser = null;
    if (verified?.user) {
        try {
            const raw = verified.user;
            tgUser = JSON.parse(decodeURIComponent(raw));
        } catch (e) {
            tgUser = null;
        }
    }

    // === Handle funnel requests ===
    if (type === 'funnel') {
        if (req.method === 'GET') {
            try {
                const { data: funnel, error } = await supabase
                    .from('funnels')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();
                if (error) throw error;
                if (!funnel) return res.status(404).json({ error: 'Funnel not found' });
                return res.status(200).json({ funnel });
            } catch (error) {
                console.error('Get funnel error:', error);
                return res.status(500).json({ error: error.message });
            }
        }

        if (req.method === 'PATCH') {
            try {
                let serverUser = null;
                if (tgUser?.id) {
                    const { data: u, error: userErr } = await supabase
                        .from('users')
                        .select('id, telegram_id')
                        .eq('telegram_id', tgUser.id)
                        .maybeSingle();
                    if (userErr) throw userErr;
                    serverUser = u || null;
                }

                if (!serverUser && !isDevFallback) {
                    return res.status(401).json({ error: 'Unauthorized: user not found' });
                }

                const { data: existing, error: getErr } = await supabase
                    .from('funnels')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();
                if (getErr) throw getErr;
                if (!existing) return res.status(404).json({ error: 'Funnel not found' });

                if (!isDevFallback && serverUser && existing.user_id !== serverUser.id) {
                    return res.status(403).json({ error: 'Forbidden: not the funnel owner' });
                }

                const allowed = ['name', 'elements', 'status', 'funnel_type', 'leads', 'conversions', 'revenue'];
                const updates = {};
                for (const key of allowed) {
                    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                        updates[key] = req.body[key];
                    }
                }

                if (Object.keys(updates).length === 0) {
                    return res.status(400).json({ error: 'No valid fields to update' });
                }

                updates.updated_at = new Date().toISOString();

                const { data: updated, error: updErr } = await supabase
                    .from('funnels')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (updErr) throw updErr;

                return res.status(200).json({ funnel: updated, success: true });
            } catch (error) {
                console.error('Update funnel error:', error);
                return res.status(500).json({ error: error.message });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    }

    // === Handle user requests ===
    if (type === 'user') {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { data: funnels, error } = await supabase
                .from('funnels')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json({ funnels: funnels || [] });
        } catch (error) {
            console.error('Get user funnels error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(400).json({ error: 'Invalid request type' });
}

export default wrap(handler);
