import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { userId } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data: funnels, error } = await supabase
            .from('funnels')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ funnels: funnels || [] });
    } catch (error) {
        console.error('Get funnels error:', error);
        res.status(500).json({ error: error.message });
    }
}