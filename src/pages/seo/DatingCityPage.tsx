import { useParams, Link } from "react-router-dom";
import { mockUsers, mockEvents, cities } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Users, Calendar, ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

const citySlugMap: Record<string, string> = {
  moscow: "Москва", spb: "Санкт-Петербург", kazan: "Казань",
  novosibirsk: "Новосибирск", ekaterinburg: "Екатеринбург",
  "nizhny-novgorod": "Нижний Новгород", sochi: "Сочи",
  krasnodar: "Краснодар", samara: "Самара",
  "rostov-na-donu": "Ростов-на-Дону", voronezh: "Воронеж",
  krasnoyarsk: "Красноярск", perm: "Пермь", volgograd: "Волгоград", tyumen: "Тюмень",
};

export function cityToSlug(city: string): string {
  return Object.entries(citySlugMap).find(([, v]) => v === city)?.[0] || city.toLowerCase().replace(/\s+/g, "-");
}

export default function DatingCityPage() {
  const { city } = useParams();
  const cityName = citySlugMap[city || ""] || city || "";
  const users = mockUsers.filter(u => u.city === cityName).slice(0, 24);
  const events = mockEvents.filter(e => e.city === cityName);
  const popular = [...users].sort((a, b) => b.friendsCount - a.friendsCount).slice(0, 6);
  const newUsers = users.slice(-6);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`Знакомства в городе ${cityName} — ВДрузьях`}
        description={`Найдите людей для знакомства в городе ${cityName}. ${users.length}+ анкет, события и общение. Дружба, отношения, совместные прогулки.`}
        canonical={`https://mutual-connections.lovable.app/dating/${city}`}
      />

      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/cities" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">В</span>
              </div>
              <span className="text-lg font-bold text-foreground">ВДрузьях</span>
            </div>
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
            <Link to="/cities" className="hover:text-foreground">Города</Link>
            <span>/</span>
            <span className="text-foreground">{cityName}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Знакомства в городе {cityName}</h1>
          <p className="text-muted-foreground mt-2">
            {users.length} пользователей ищут знакомства в {cityName}. Находите людей по интересам и целям общения.
          </p>
        </div>

        {/* Popular */}
        {popular.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Популярные профили
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {popular.map(u => (
                <Link key={u.id} to={`/u/${u.username}`} className="bg-card rounded-lg border border-border p-3 text-center hover:shadow-elevated transition-shadow">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-foreground truncate">{u.name.split(" ")[0]}</p>
                  <p className="text-xs text-muted-foreground">{u.age} лет</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All users */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Все анкеты — {cityName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <Link key={u.id} to={`/u/${u.username}`} className="bg-card rounded-lg border border-border p-4 flex gap-3 hover:shadow-elevated transition-shadow">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={u.avatar} alt={u.name} />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{u.name}, {u.age}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{u.about}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {u.interests.slice(0, 3).map(i => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{i}</Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {users.length === 0 && <p className="text-muted-foreground text-center py-8">Пока нет анкет в этом городе</p>}
        </section>

        {/* Events */}
        {events.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> События знакомств в {cityName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map(e => (
                <div key={e.id} className="bg-card rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{e.date} · {e.time}</p>
                  <p className="text-xs text-muted-foreground">{e.attendees} участников</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-primary rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Присоединяйтесь к ВДрузьях</h2>
          <p className="text-primary-foreground/80 mb-5">Создайте анкету и начните знакомиться в {cityName}</p>
          <Link to="/auth/register"><Button variant="secondary" size="lg">Создать анкету бесплатно</Button></Link>
        </section>
      </div>
    </div>
  );
}
