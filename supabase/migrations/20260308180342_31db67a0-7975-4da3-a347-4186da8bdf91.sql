
-- Invites table
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  invite_code text NOT NULL UNIQUE,
  uses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invites" ON public.invites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invites" ON public.invites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can read invite by code" ON public.invites FOR SELECT TO anon USING (true);
CREATE POLICY "Service can update invites" ON public.invites FOR UPDATE TO authenticated USING (true);

-- Achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User streaks table
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 1,
  longest_streak integer NOT NULL DEFAULT 1,
  last_login_date date NOT NULL DEFAULT CURRENT_DATE,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streak" ON public.user_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own streak" ON public.user_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.user_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Profile boosts table
CREATE TABLE public.profile_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
ALTER TABLE public.profile_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own boosts" ON public.profile_boosts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own boosts" ON public.profile_boosts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_invites_code ON public.invites(invite_code);
CREATE INDEX idx_achievements_user ON public.achievements(user_id);
CREATE INDEX idx_streaks_user ON public.user_streaks(user_id);
CREATE INDEX idx_boosts_user_expires ON public.profile_boosts(user_id, expires_at);
CREATE INDEX idx_likes_from_created ON public.likes(from_user_id, created_at);
