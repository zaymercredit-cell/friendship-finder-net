
CREATE TABLE public.relationship_coach_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid,
  context_type text NOT NULL DEFAULT 'chat_reply',
  suggestion text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.relationship_coach_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own coach suggestions"
  ON public.relationship_coach_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own coach suggestions"
  ON public.relationship_coach_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coach suggestions"
  ON public.relationship_coach_suggestions FOR DELETE
  USING (auth.uid() = user_id);
