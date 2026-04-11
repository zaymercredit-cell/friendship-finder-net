
-- Fix: conversation creation needs to be atomic (can't insert participants before conversation exists)
-- Drop restrictive policy and use a security definer function instead
DROP POLICY "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (true);

-- Function to find or create a 1-on-1 conversation
CREATE OR REPLACE FUNCTION public.find_or_create_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id uuid;
BEGIN
  -- Find existing 1-on-1 conversation
  SELECT cp1.conversation_id INTO conv_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = auth.uid()
    AND cp2.user_id = other_user_id
    AND cp1.user_id != cp2.user_id;

  IF conv_id IS NOT NULL THEN
    -- Unhide if hidden
    UPDATE conversation_participants SET hidden_at = NULL
    WHERE conversation_id = conv_id AND user_id = auth.uid() AND hidden_at IS NOT NULL;
    RETURN conv_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (id) VALUES (gen_random_uuid()) RETURNING id INTO conv_id;
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, auth.uid());
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, other_user_id);

  RETURN conv_id;
END;
$$;
