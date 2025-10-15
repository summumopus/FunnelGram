import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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