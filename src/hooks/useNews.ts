import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  image_gallery: string[];
  category: string;
  tags: string[];
  source: string;
  source_url: string;
  city: string;
  status: string;
  is_duplicate: boolean;
  duplicate_of: string | null;
  author_id: string | null;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function generateSlug(title: string): string {
  const ru: Record<string, string> = {
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',
    л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',
    ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
  };
  return title
    .toLowerCase()
    .split("")
    .map(c => ru[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function useNewsList(opts?: { category?: string; city?: string; status?: string; limit?: number; offset?: number; year?: number; month?: number }) {
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;
  return useQuery({
    queryKey: ["news", "list", opts],
    queryFn: async () => {
      let q = supabase.from("news").select("*").order("published_at", { ascending: false }).range(offset, offset + limit - 1);
      if (opts?.status) q = q.eq("status", opts.status);
      else q = q.eq("status", "published");
      if (opts?.category) q = q.eq("category", opts.category);
      if (opts?.city) q = q.eq("city", opts.city);
      if (opts?.year) {
        const start = `${opts.year}-${String(opts.month ?? 1).padStart(2, "0")}-01T00:00:00Z`;
        const endMonth = opts?.month ? opts.month : 12;
        const endYear = opts?.month ? opts.year : opts.year;
        const end = opts?.month
          ? new Date(endYear, endMonth, 1).toISOString()
          : `${endYear + 1}-01-01T00:00:00Z`;
        q = q.gte("published_at", start).lt("published_at", end);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NewsArticle[];
    },
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: ["news", "article", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("slug", slug).eq("status", "published").single();
      if (error) throw error;
      return data as NewsArticle;
    },
    enabled: !!slug,
  });
}

export function useRelatedNews(article: NewsArticle | undefined) {
  return useQuery({
    queryKey: ["news", "related", article?.id],
    queryFn: async () => {
      if (!article) return [];
      const { data } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .eq("category", article.category)
        .neq("id", article.id)
        .order("published_at", { ascending: false })
        .limit(6);
      return (data ?? []) as NewsArticle[];
    },
    enabled: !!article,
  });
}

export function useLatestNews(limit = 10) {
  return useQuery({
    queryKey: ["news", "latest", limit],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(limit);
      return (data ?? []) as NewsArticle[];
    },
  });
}

// Admin hooks
export function useAdminNewsList(status?: string) {
  return useQuery({
    queryKey: ["admin", "news", status],
    queryFn: async () => {
      let q = supabase.from("news").select("*").order("created_at", { ascending: false });
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NewsArticle[];
    },
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<NewsArticle> & { title: string }) => {
      const slug = input.slug || generateSlug(input.title) + "-" + Date.now().toString(36);
      const { data, error } = await supabase.from("news").insert({ ...input, slug } as any).select().single();
      if (error) throw error;
      return data as NewsArticle;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "news"] }),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewsArticle> & { id: string }) => {
      const { data, error } = await supabase.from("news").update(updates as any).eq("id", id).select().single();
      if (error) throw error;
      return data as NewsArticle;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "news"] });
      qc.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function usePublishNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").update({ status: "published", published_at: new Date().toISOString() } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "news"] });
      qc.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export { generateSlug };
