import crypto from 'crypto';
let createClient;
try {
    // Importing the supabase client may throw in some restricted runtimes
    // so we lazily require it and guard against failures.
    // Use dynamic import to keep bundlers happy.
    // eslint-disable-next-line global-require
    createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
    console.warn('Warning: @supabase/supabase-js could not be loaded:', e && e.message);
    createClient = null;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Supabase URL or service key missing. Server-side APIs will not function correctly without server credentials.');
}

// Create a lightweight stub that mimics the interface enough to avoid top-level crashes.
function makeStubSupabase() {
    const err = new Error('Supabase service not configured');
    const thrower = () => ({
        select: async () => { throw err; },
        insert: async () => { throw err; },
        update: async () => { throw err; },
        delete: async () => { throw err; },
        maybeSingle: async () => { throw err; },
        single: async () => { throw err; },
        order: () => ({ select: async () => { throw err; } }),
        eq: () => ({ select: async () => { throw err; } }),
        from: () => thrower()
    });
    return { from: () => thrower() };
}

export const createServerSupabase = () => {
    try {
        if (!createClient) {
            return makeStubSupabase();
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return makeStubSupabase();
        return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    } catch (e) {
        console.error('Failed to create Supabase client:', e && e.message);
        return makeStubSupabase();
    }
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
