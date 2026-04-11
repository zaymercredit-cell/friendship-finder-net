
CREATE TABLE public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid,
  suggestion_type text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions" ON public.ai_suggestions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions" ON public.ai_suggestions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions" ON public.ai_suggestions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_ai_suggestions_user ON public.ai_suggestions(user_id, created_at DESC);
