
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status_text text DEFAULT '',
  ADD COLUMN IF NOT EXISTS work text DEFAULT '',
  ADD COLUMN IF NOT EXISTS education text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ideal_date text DEFAULT '',
  ADD COLUMN IF NOT EXISTS favorite_movies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_music text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_books text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_places text[] DEFAULT '{}';
