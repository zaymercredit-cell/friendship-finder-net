import { Link, useSearchParams } from "react-router-dom";
import { useNewsList, NewsArticle } from "@/hooks/useNews";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SeoHead from "@/components/SeoHead";

const CATEGORIES = [
  { key: "all", label: "Все" },
  { key: "city", label: "Город" },
  { key: "incidents", label: "Происшествия" },
  { key: "business", label: "Бизнес" },
  { key: "sport", label: "Спорт" },
  { key: "culture", label: "Культура" },
  { key: "society", label: "Общество" },
];

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link to={`/news/${article.slug}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {article.cover_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">{CATEGORIES.find(c => c.key === article.category)?.label ?? article.category}</Badge>
          {article.published_at && (
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{format(new Date(article.published_at), "d MMM yyyy", { locale: ru })}</span>
          )}
        </div>
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        {article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 4).map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function NewsListPage() {
  const [sp, setSp] = useSearchParams();
  const cat = sp.get("category") || "all";
  const { data: articles = [], isLoading } = useNewsList({ category: cat === "all" ? undefined : cat });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SeoHead title="Новости — ВДрузьях" description="Последние новости на платформе ВДрузьях" canonical="/news" />
      <h1 className="text-2xl font-bold text-foreground mb-6">Новости</h1>
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setSp(c.key === "all" ? {} : { category: c.key })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Новостей пока нет</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(a => <NewsCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
