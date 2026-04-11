
-- Profile views table with 30-min dedup constraint
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint for 30-min dedup handled in application logic
CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id, created_at DESC);
CREATE INDEX idx_profile_views_viewer_id ON public.profile_views(viewer_id, created_at DESC);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Users can see who viewed their profile
CREATE POLICY "Users can view own profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = profile_id OR auth.uid() = viewer_id);

-- Users can insert views (viewer_id must be self)
CREATE POLICY "Users can insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Subscriptions table for VIP
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'vip',
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add anonymous browsing setting to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS anonymous_browsing boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
