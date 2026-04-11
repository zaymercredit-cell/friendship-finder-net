
-- Add is_super column to likes
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS is_super boolean NOT NULL DEFAULT false;

-- Add daily_super_likes_count helper index
CREATE INDEX IF NOT EXISTS idx_likes_super ON public.likes (from_user_id, created_at) WHERE is_super = true;
