
CREATE TABLE public.ai_avatar_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  personality_summary TEXT DEFAULT '',
  topics_allowed TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_avatar_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any avatar profile" ON public.ai_avatar_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own avatar profile" ON public.ai_avatar_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatar profile" ON public.ai_avatar_profiles FOR UPDATE USING (auth.uid() = user_id);
