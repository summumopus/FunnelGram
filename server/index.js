import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Telegram Authentication
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { initData } = req.body;

        // In production, validate Telegram WebApp data here
        // For now, we'll trust the frontend for demo purposes

        const userData = parseTelegramData(initData);

        // Upsert user in database
        const { data: user, error } = await supabase
            .from('users')
            .upsert({
                telegram_id: userData.id,
                telegram_username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ user, success: true });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

function parseTelegramData(initData) {
    // Simple parser for Telegram WebApp initData
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (userStr) {
        return JSON.parse(userStr);
    }
    return {
        id: Math.random() * 1000000,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user'
    };
}

// Funnel CRUD Operations
app.get('/api/funnels/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: funnels, error } = await supabase
            .from('funnels')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ funnels });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/funnels', async (req, res) => {
    try {
        const { userId, name, funnelType } = req.body;

        const { data: funnel, error } = await supabase
            .from('funnels')
            .insert([
                {
                    user_id: userId,
                    name,
                    funnel_type: funnelType,
                    status: 'draft'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.json({ funnel, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/funnels/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data: funnel, error } = await supabase
            .from('funnels')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ funnel, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/funnels/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('funnels')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe Payment Integration
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        // This would integrate with Stripe
        // For demo, returning mock success
        res.json({
            client_secret: 'pi_mock_secret',
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Email Provider Integration (SendGrid/Mailchimp)
app.post('/api/connect-email-provider', async (req, res) => {
    try {
        const { provider, apiKey } = req.body;

        // In production, validate API key and store securely
        res.json({
            success: true,
            message: `${provider} connected successfully`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});