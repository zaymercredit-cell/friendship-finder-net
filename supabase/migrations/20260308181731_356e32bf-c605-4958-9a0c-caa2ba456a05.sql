
-- DB indexes for SEO and performance
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);
CREATE INDEX IF NOT EXISTS idx_meetups_city ON public.meetups(city);
CREATE INDEX IF NOT EXISTS idx_meetups_start_time ON public.meetups(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_user_score ON public.compatibility_scores(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_user_locations_coords ON public.user_locations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);
