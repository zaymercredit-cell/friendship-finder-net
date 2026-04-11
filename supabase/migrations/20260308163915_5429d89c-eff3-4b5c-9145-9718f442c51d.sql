
-- User locations for geo-dating
CREATE TABLE public.user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  city text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all locations" ON public.user_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upsert own location" ON public.user_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own location" ON public.user_locations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Compatibility scores cache
CREATE TABLE public.compatibility_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  signals_json jsonb DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);
ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores" ON public.compatibility_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert scores" ON public.compatibility_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service can update scores" ON public.compatibility_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Meetups
CREATE TABLE public.meetups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  city text,
  lat double precision,
  lng double precision,
  start_time timestamp with time zone NOT NULL,
  host_user_id uuid NOT NULL,
  max_participants integer DEFAULT 50,
  cover_url text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view meetups" ON public.meetups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create meetups" ON public.meetups FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Hosts can update meetups" ON public.meetups FOR UPDATE TO authenticated USING (auth.uid() = host_user_id);

-- Meetup participants
CREATE TABLE public.meetup_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'joined',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(meetup_id, user_id)
);
ALTER TABLE public.meetup_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view participants" ON public.meetup_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join meetups" ON public.meetup_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave meetups" ON public.meetup_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.meetup_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User interactions for behavioral signals
CREATE TABLE public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own interactions" ON public.user_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own interactions" ON public.user_interactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Add show_on_map to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_on_map boolean DEFAULT true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_user_score ON public.compatibility_scores(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_user_locations_coords ON public.user_locations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON public.user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetups_start_time ON public.meetups(start_time);
CREATE INDEX IF NOT EXISTS idx_meetup_participants_meetup ON public.meetup_participants(meetup_id);
