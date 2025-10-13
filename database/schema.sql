-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Telegram users who create funnels)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Funnels table
CREATE TABLE IF NOT EXISTS funnels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_user_id TEXT NOT NULL REFERENCES users(telegram_user_id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Funnel steps table
CREATE TABLE IF NOT EXISTS funnel_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('landing', 'lead_capture', 'upsell', 'thank_you', 'content')),
    title TEXT NOT NULL,
    content TEXT,
    button_text TEXT,
    form_fields JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id),
    telegram_user_id TEXT,
    email TEXT,
    name TEXT,
    phone TEXT,
    submitted_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS funnel_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id),
    step_id UUID REFERENCES funnel_steps(id),
    telegram_user_id TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('step_view', 'step_complete', 'lead_captured', 'upsell_view', 'purchase')),
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id),
    telegram_user_id TEXT NOT NULL,
    current_step_id UUID REFERENCES funnel_steps(id),
    completed BOOLEAN DEFAULT FALSE,
    progress_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(funnel_id, telegram_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnels_telegram_user_id ON funnels(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_steps_order ON funnel_steps(funnel_id, step_order);
CREATE INDEX IF NOT EXISTS idx_leads_funnel_id ON leads(funnel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_id ON funnel_analytics(funnel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON funnel_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_composite ON user_progress(funnel_id, telegram_user_id);

-- RLS (Row Level Security) Policies
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for funnel creators
CREATE POLICY "Users can view own funnels" ON funnels FOR ALL USING (telegram_user_id = current_user);
CREATE POLICY "Users can view own funnel steps" ON funnel_steps FOR ALL USING (funnel_id IN (SELECT id FROM funnels WHERE telegram_user_id = current_user));
CREATE POLICY "Users can view own leads" ON leads FOR ALL USING (funnel_id IN (SELECT id FROM funnels WHERE telegram_user_id = current_user));
CREATE POLICY "Users can view own analytics" ON funnel_analytics FOR ALL USING (funnel_id IN (SELECT id FROM funnels WHERE telegram_user_id = current_user));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();