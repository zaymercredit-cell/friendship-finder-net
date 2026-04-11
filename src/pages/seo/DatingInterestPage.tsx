import { useParams, Link } from "react-router-dom";
import { mockUsers, allInterests } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

const interestSlugMap: Record<string, string> = {
  travel: "Путешествия", photography: "Фотография", sport: "Спорт",
  cinema: "Кино", music: "Музыка", cooking: "Кулинария",
  yoga: "Йога", it: "IT", art: "Искусство", books: "Книги",
  mountains: "Горы", cycling: "Велоспорт", games: "Игры",
  dance: "Танцы", science: "Наука", design: "Дизайн",
  languages: "Языки", volunteering: "Волонтёрство", theatre: "Театр",
  coffee: "Кофе", wine: "Вино", running: "Бег",
  swimming: "Плавание", meditation: "Медитация",
};

export function interestToSlug(interest: string): string {
  return Object.entries(interestSlugMap).find(([, v]) => v === interest)?.[0] || interest.toLowerCase();
}

export default function DatingInterestPage() {
  const { interest } = useParams();
  const interestName = interestSlugMap[interest || ""] || interest || "";
  const users = mockUsers.filter(u => u.interests.includes(interestName)).slice(0, 24);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`Знакомства по интересу «${interestName}» — ВДрузьях`}
        description={`${users.length}+ людей увлекаются темой «${interestName}». Найдите единомышленников для общения, дружбы и совместных активностей.`}
        canonical={`https://mutual-connections.lovable.app/dating/interests/${interest}`}
      />

      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/interests" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">В</span>
              </div>
              <span className="text-lg font-bold text-foreground">ВДрузьях</span>
            </Link>
          </div>
          <div className="flex gap-2">
            <Link to="/auth/login"><Button variant="ghost" size="sm">Войти</Button></Link>
            <Link to="/auth/register"><Button size="sm">Регистрация</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link to="/interests" className="hover:text-foreground">Интересы</Link>
            <span>/</span>
            <span className="text-foreground">{interestName}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary" />
            Знакомства: {interestName}
          </h1>
          <p className="text-muted-foreground mt-2">{users.length} людей увлекаются темой «{interestName}»</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <Link key={u.id} to={`/u/${u.username}`} className="bg-card rounded-lg border border-border p-4 flex gap-3 hover:shadow-elevated transition-shadow">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage src={u.avatar} alt={u.name} />
                <AvatarFallback>{u.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{u.name}, {u.age}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">{u.city}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.interests.slice(0, 4).map(i => (
                    <Badge key={i} variant={i === interestName ? "default" : "secondary"} className="text-[10px]">{i}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {users.length === 0 && <p className="text-muted-foreground text-center py-8">Пока нет анкет с этим интересом</p>}

        <section className="bg-primary rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Любите {interestName.toLowerCase()}?</h2>
          <p className="text-primary-foreground/80 mb-5">Создайте анкету и найдите единомышленников</p>
          <Link to="/auth/register"><Button variant="secondary" size="lg">Создать анкету бесплатно</Button></Link>
        </section>
      </div>
    </div>
  );
}
