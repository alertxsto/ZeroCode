-- COMPREHENSIVE FIX: Registration & User Schema Update
-- Please run this in your Neon SQL Editor

-- 1. Ensure all required columns exist in 'users' table
DO $$
BEGIN
    -- Add avatar column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE users ADD COLUMN avatar TEXT;
    END IF;

    -- Add border column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'border') THEN
        ALTER TABLE users ADD COLUMN border VARCHAR(255);
    END IF;

    -- Add subscription_tier column if it doesn't exist (if not already there)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
        ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
    END IF;

    -- Add streak_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak_count') THEN
        ALTER TABLE users ADD COLUMN streak_count INTEGER DEFAULT 0;
    END IF;

    -- Add last_activity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_activity') THEN
        ALTER TABLE users ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Create the user_dashboard_stats table (if missing)
CREATE TABLE IF NOT EXISTS user_dashboard_stats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    modules_cleared INTEGER DEFAULT 0,
    total_modules_available INTEGER DEFAULT 123,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_streak_days INTEGER DEFAULT 0,
    max_streak_days INTEGER DEFAULT 0,
    total_focus_minutes INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_dashboard_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply Trigger to 'users' table
DROP TRIGGER IF EXISTS on_user_created_stats ON users;
CREATE TRIGGER on_user_created_stats
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_stats();

-- 5. Backfill for existing users who might be missing stats records
INSERT INTO user_dashboard_stats (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
