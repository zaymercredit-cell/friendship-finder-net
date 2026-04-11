
CREATE TABLE public.personality_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  personality_type text NOT NULL DEFAULT '',
  traits jsonb NOT NULL DEFAULT '{}',
  answers jsonb NOT NULL DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any personality profile" ON public.personality_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own personality profile" ON public.personality_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personality profile" ON public.personality_profiles FOR UPDATE USING (auth.uid() = user_id);
