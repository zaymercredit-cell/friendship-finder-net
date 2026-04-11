
-- News articles table
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  cover_image text DEFAULT NULL,
  image_gallery text[] DEFAULT '{}',
  category text DEFAULT 'city',
  tags text[] DEFAULT '{}',
  source text DEFAULT '',
  source_url text DEFAULT '',
  city text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  is_duplicate boolean DEFAULT false,
  duplicate_of uuid REFERENCES public.news(id) DEFAULT NULL,
  author_id uuid DEFAULT NULL,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  canonical_url text DEFAULT '',
  published_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published news" ON public.news
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all news" ON public.news
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Index for slug lookups
CREATE INDEX idx_news_slug ON public.news(slug);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_city ON public.news(city);
CREATE INDEX idx_news_status ON public.news(status);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);

-- Auto-update updated_at
CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
