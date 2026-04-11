
-- Add new profile fields for dating
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS looking_for_gender text DEFAULT 'any',
ADD COLUMN IF NOT EXISTS communication_goals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS show_in_discover boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS ready_for_meetings boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ready_for_chat boolean DEFAULT true;

-- Dating preferences table
CREATE TABLE public.dating_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  looking_for_gender text DEFAULT 'any',
  min_age integer DEFAULT 18,
  max_age integer DEFAULT 60,
  preferred_city_mode text DEFAULT 'my_city',
  communication_goals text[] DEFAULT '{}',
  show_in_discover boolean DEFAULT true,
  ready_for_meetings boolean DEFAULT false,
  ready_for_chat boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dating_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dating preferences" ON public.dating_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dating preferences" ON public.dating_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dating preferences" ON public.dating_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Likes table
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own likes" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = from_user_id);

-- Passes table
CREATE TABLE public.passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passes" ON public.passes FOR SELECT TO authenticated USING (auth.uid() = from_user_id);
CREATE POLICY "Users can insert own passes" ON public.passes FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can delete own passes" ON public.passes FOR DELETE TO authenticated USING (auth.uid() = from_user_id);

-- Matches table
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE(user1_id, user2_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to check and create match on mutual like
CREATE OR REPLACE FUNCTION public.check_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.likes WHERE from_user_id = NEW.to_user_id AND to_user_id = NEW.from_user_id) THEN
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (LEAST(NEW.from_user_id, NEW.to_user_id), GREATEST(NEW.from_user_id, NEW.to_user_id))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_like_check_match
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.check_mutual_like();

-- Enable realtime for matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
