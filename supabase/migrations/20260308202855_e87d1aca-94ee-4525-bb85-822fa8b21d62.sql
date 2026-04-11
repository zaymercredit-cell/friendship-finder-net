
CREATE TABLE public.dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  idea TEXT NOT NULL DEFAULT '',
  idea_emoji TEXT DEFAULT '☕',
  location TEXT DEFAULT '',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  message_text TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dates" ON public.dates FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can insert own dates" ON public.dates FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update own dates" ON public.dates FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);
