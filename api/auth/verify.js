import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Supabase URL or service key missing. Server-side APIs will not function correctly without server credentials.');
}

export const createServerSupabase = () => {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
};

export function verifyInitData(initData, botToken) {
    if (!initData || !botToken) return null;

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    const entries = [];
    for (const [key, value] of params.entries()) {
        if (key === 'hash') continue;
        entries.push(`${key}=${value}`);
    }
    entries.sort();
    const dataCheckString = entries.join('\n');

    const secret = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

    try {
        const valid = crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(hash, 'hex'));
        if (!valid) return null;
    } catch (e) {
        return null;
    }

    const result = {};
    for (const [k, v] of params.entries()) result[k] = v;
    return result;
}
