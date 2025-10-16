import { wrap } from './debugWrapper.js';

async function handler(req, res) {
    // Return Vercel-provided git info (if available) and a few envs to help debug
    const info = {
        ok: true,
        vercel_commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
        vercel_repo: process.env.VERCEL_GIT_REPO_SLUG || null,
        vercel_env: process.env.VERCEL_ENV || null,
        node_env: process.env.NODE_ENV || null,
        has_supabase_url: !!process.env.SUPABASE_URL,
        has_supabase_service_key: !!process.env.SUPABASE_SERVICE_KEY,
        has_telegram_bot_token: !!process.env.TELEGRAM_BOT_TOKEN
    };

    return res.status(200).json(info);
}

export default wrap(handler);
