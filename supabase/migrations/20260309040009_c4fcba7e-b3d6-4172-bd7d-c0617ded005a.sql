-- Table for user bans/blocks by admin
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Only admins can manage bans
CREATE POLICY "Admins can manage bans"
ON public.user_bans FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Any authenticated user can check if they are banned
CREATE POLICY "Users can check own ban status"
ON public.user_bans FOR SELECT
USING (auth.uid() = user_id);

-- Add is_banned column to profiles for quick checks
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Index for quick lookups
CREATE INDEX idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;