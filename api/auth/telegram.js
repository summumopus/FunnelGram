import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client should use a service role / service key.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Supabase URL or service key missing. api/auth/telegram will not function correctly without server credentials.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Verify Telegram WebApp initData using bot token.
 * Returns parsed params map on success, or null on failure.
 */
function verifyInitData(initData, botToken) {
    if (!initData || !botToken) return null;

    // initData is a query-string like 'key1=value1&key2=value2...'
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    // Collect key=value for all params except 'hash'
    const entries = [];
    for (const [key, value] of params.entries()) {
        if (key === 'hash') continue;
        entries.push(`${key}=${value}`);
    }

    // Sort lexicographically by key (which is equivalent to sorting the strings)
    entries.sort();
    const dataCheckString = entries.join('\n');

    // secret key is sha256 of bot token (binary)
    const secret = crypto.createHash('sha256').update(botToken).digest();

    // HMAC-SHA256 of data_check_string using secret
    const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

    // Compare in constant time
    const valid = crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(hash, 'hex'));
    if (!valid) return null;

    // On success, return params as an object
    const result = {};
    for (const [k, v] of params.entries()) result[k] = v;
    return result;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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