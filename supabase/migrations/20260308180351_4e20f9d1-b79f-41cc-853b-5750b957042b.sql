
-- Fix overly permissive RLS on invites
DROP POLICY "Service can update invites" ON public.invites;
CREATE POLICY "Users can update own invites" ON public.invites FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY "Anyone can read invite by code" ON public.invites;
CREATE POLICY "Anyone can read invites" ON public.invites FOR SELECT USING (true);
