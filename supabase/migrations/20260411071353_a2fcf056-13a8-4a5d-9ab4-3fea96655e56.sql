
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  gift_type TEXT NOT NULL DEFAULT 'rose',
  conversation_id UUID REFERENCES public.conversations(id),
  message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send gifts"
ON public.gifts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view own gifts"
ON public.gifts FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE INDEX idx_gifts_receiver ON public.gifts(receiver_id);
CREATE INDEX idx_gifts_sender ON public.gifts(sender_id);
