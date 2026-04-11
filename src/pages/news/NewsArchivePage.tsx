import { useParams, Link } from "react-router-dom";
import { useNewsList } from "@/hooks/useNews";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import SeoHead from "@/components/SeoHead";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export default function NewsArchivePage() {
  const { year, month } = useParams<{ year?: string; month?: string }>();
  const y = year ? parseInt(year) : new Date().getFullYear();
  const m = month ? parseInt(month) : undefined;

  const { data: articles = [], isLoading } = useNewsList({ year: y, month: m, limit: 100 });

  const title = m ? `Архив новостей — ${MONTHS[m - 1]} ${y}` : `Архив новостей — ${y}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SeoHead title={title} description={`Архив новостей за ${m ? MONTHS[m-1] + " " : ""}${y}`} />
      <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">← Все новости</Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>

      {!month && (
        <div className="flex flex-wrap gap-2 mb-6">
          {MONTHS.map((name, i) => (
            <Link key={i} to={`/news/archive/${y}/${i + 1}`} className="px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              {name}
            </Link>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Нет новостей за этот период</p>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <Link key={a.id} to={`/news/${a.slug}`} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
              {a.cover_image && <img src={a.cover_image} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground line-clamp-1">{a.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                  {a.published_at && <span>{format(new Date(a.published_at), "d MMM yyyy", { locale: ru })}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
