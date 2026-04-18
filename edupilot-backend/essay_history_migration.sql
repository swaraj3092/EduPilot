-- Migration: Create essays table for persistent history
CREATE TABLE IF NOT EXISTS public.essays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    essay_text TEXT NOT NULL,
    essay_type TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    scores JSONB NOT NULL,
    improved_version TEXT NOT NULL,
    plagiarism JSONB NOT NULL,
    word_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own essays." ON public.essays
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own essays." ON public.essays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own essays." ON public.essays
    FOR DELETE USING (auth.uid() = user_id);
