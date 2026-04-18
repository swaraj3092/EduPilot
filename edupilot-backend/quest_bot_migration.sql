-- Add quests tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS quests_completed JSONB DEFAULT '[]'::jsonb;

-- Optional: Insert dummy data if profiles is empty (for demo)
-- These represent high-score 'Elite Bots' to make the leaderboard challenging
INSERT INTO profiles (user_id, full_name, xp, streak, target_country)
SELECT 
  gen_random_uuid()::text, 
  name, 
  xp, 
  7, 
  country
FROM (VALUES 
  ('Alice Zhang', 14200, 'USA'),
  ('Lucas Müller', 11800, 'Germany'),
  ('Yuki Tanaka', 9500, 'Japan'),
  ('James Wilson', 8200, 'UK'),
  ('Elena Rossi', 7500, 'Italy')
) AS elite(name, xp, country)
ON CONFLICT DO NOTHING;
