DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
CREATE OR REPLACE FUNCTION public.protect_profile_vip() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('anon', 'authenticated') THEN
  IF (TG_OP = 'INSERT' AND COALESCE(NEW.is_vip, false)) OR (TG_OP = 'UPDATE' AND NEW.is_vip IS DISTINCT FROM OLD.is_vip) THEN
   RAISE EXCEPTION 'VIP entitlements can only be updated by verified server operations' USING ERRCODE = '42501';
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER protect_profile_vip BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_vip();