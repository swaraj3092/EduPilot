-- Add XP and Streak columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_login_date DATE DEFAULT CURRENT_DATE;

-- Optional: Add a function to handle automatic streak incrementing
-- This would be called whenever a user logs in
CREATE OR REPLACE FUNCTION update_streak()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    streak = CASE 
      WHEN last_login_date = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1
      WHEN last_login_date < CURRENT_DATE - INTERVAL '1 day' THEN 1
      ELSE streak
    END,
    last_login_date = CURRENT_DATE
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;
