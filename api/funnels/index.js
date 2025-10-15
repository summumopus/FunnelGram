import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { userId, name, funnelType } = req.body;

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