export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // If Supabase isn't configured, return 503 so the function doesn't crash.
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            return res.status(503).json({ error: 'Service unavailable: supabase not configured' });
        }

        const { createServerSupabase } = await import('../auth/verify.js');
        const supabase = createServerSupabase();

        const { data: templates, error } = await supabase
            .from('templates')
            .select('*')
            .order('category');

        if (error) throw error;

        res.status(200).json({ templates: templates || [] });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: error.message });
    }
}