import { wrap } from '../../api/debugWrapper.js';

async function handler(req, res) {
    const { funnelId } = req.query;

    // If Supabase isn't configured, return 503 so the function doesn't crash.
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        return res.status(503).json({ error: 'Service unavailable: supabase not configured' });
    }

    const { createServerSupabase, verifyInitData } = await import('../auth/verify.js');
    const supabase = createServerSupabase();

    // Accept initData for server-side verification
    const initData = req.headers['x-tg-initdata'] || req.body?.initData || '';
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const verified = verifyInitData(initData, BOT_TOKEN);
    const isDevFallback = !verified && process.env.NODE_ENV !== 'production';

    if (!verified && !isDevFallback) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid Telegram initData' });
    }

    // Parse telegram user from verified params if available
    let tgUser = null;
    if (verified && verified.user) {
        try {
            // user may be URI encoded or raw JSON
            const raw = verified.user;
            try {
                tgUser = JSON.parse(decodeURIComponent(raw));
            } catch (e) {
                try {
                    tgUser = JSON.parse(raw);
                } catch (e2) {
                    tgUser = null;
                }
            }
        } catch (e) {
            tgUser = null;
        }
    }

    if (req.method === 'GET') {
        try {
            const { data: funnel, error } = await supabase
                .from('funnels')
                .select('*')
                .eq('id', funnelId)
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
            // Verify owner: find server user by telegram_id
            let serverUser = null;
            if (tgUser && tgUser.id) {
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

            // Ensure funnel exists
            const { data: existing, error: getErr } = await supabase
                .from('funnels')
                .select('*')
                .eq('id', funnelId)
                .maybeSingle();
            if (getErr) throw getErr;
            if (!existing) return res.status(404).json({ error: 'Funnel not found' });

            // Ownership check (serverUser.id should match funnels.user_id)
            if (!isDevFallback && serverUser && existing.user_id !== serverUser.id) {
                return res.status(403).json({ error: 'Forbidden: not the funnel owner' });
            }

            // Acceptable fields to update
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
                .eq('id', funnelId)
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

export default wrap(handler);
