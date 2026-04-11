
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-covers', 'profile-covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('community-covers', 'community-covers', true) ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- RLS policies for profile-covers bucket
CREATE POLICY "Users can upload own cover"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own cover"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own cover"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-covers');

-- RLS policies for post-images bucket
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- RLS policies for community-covers bucket
CREATE POLICY "Users can upload community covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update community covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete community covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view community covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-covers');
