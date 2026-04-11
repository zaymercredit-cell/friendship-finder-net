import { useParams, Link } from "react-router-dom";
import { useNewsArticle, useRelatedNews, useLatestNews } from "@/hooks/useNews";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, ArrowLeft, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SeoHead from "@/components/SeoHead";

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useNewsArticle(slug || "");
  const { data: related = [] } = useRelatedNews(article);
  const { data: latest = [] } = useLatestNews(10);

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 w-2/3 bg-muted animate-pulse rounded mb-4" />
      <div className="h-64 bg-muted animate-pulse rounded-xl mb-4" />
      <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}</div>
    </div>
  );

  if (!article) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground mb-2">Новость не найдена</h1>
      <Link to="/news" className="text-primary hover:underline">← К списку новостей</Link>
    </div>
  );

  const wasUpdated = article.updated_at && article.published_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 60000;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SeoHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonical={article.canonical_url || `/news/${article.slug}`}
      />

      <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Все новости
      </Link>

      <article className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{article.category}</Badge>
            {article.published_at && (
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{format(new Date(article.published_at), "d MMMM yyyy, HH:mm", { locale: ru })}</span>
            )}
            {wasUpdated && (
              <span className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />Обновлено: {format(new Date(article.updated_at), "d MMM, HH:mm", { locale: ru })}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{article.title}</h1>
          {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
        </div>

        {article.cover_image && (
          <div className="rounded-xl overflow-hidden">
            <img src={article.cover_image} alt={article.title} className="w-full object-cover max-h-[500px]" />
          </div>
        )}

        <div className="prose prose-sm sm:prose max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br/>") }} />

        {article.image_gallery?.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Фотогалерея</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {article.image_gallery.map((img, i) => (
                <img key={i} src={img} alt={`${article.title} фото ${i + 1}`} className="rounded-lg w-full h-40 object-cover" loading="lazy" />
              ))}
            </div>
          </div>
        )}

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
          </div>
        )}

        {article.source && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            Источник: {article.source_url ? <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">{article.source}<ExternalLink className="h-3 w-3" /></a> : article.source}
          </div>
        )}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Похожие новости</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.slice(0, 6).map(a => (
              <Link key={a.id} to={`/news/${a.slug}`} className="group block rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">{a.title}</h3>
                {a.published_at && <p className="text-xs text-muted-foreground mt-1">{format(new Date(a.published_at), "d MMM yyyy", { locale: ru })}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Последние новости</h2>
          <div className="space-y-2">
            {latest.filter(a => a.id !== article.id).slice(0, 10).map(a => (
              <Link key={a.id} to={`/news/${a.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                {a.cover_image && <img src={a.cover_image} alt="" className="w-16 h-12 rounded object-cover flex-shrink-0" />}
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">{a.title}</h4>
                  {a.published_at && <p className="text-xs text-muted-foreground">{format(new Date(a.published_at), "d MMM, HH:mm", { locale: ru })}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
