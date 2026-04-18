-- AI Cache table to minimize API usage and ensure data freshness
CREATE TABLE IF NOT EXISTS public.ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read (for shared knowledge efficiency)
CREATE POLICY "Public Read Access" 
ON public.ai_cache FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow service role to upsert
CREATE POLICY "Service Role Upsert" 
ON public.ai_cache FOR ALL 
TO service_role 
USING (true);
