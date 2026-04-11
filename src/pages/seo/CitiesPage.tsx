import { Link } from "react-router-dom";
import { cities, mockUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { cityToSlug } from "./DatingCityPage";

export default function CitiesPage() {
  const cityCounts = cities.map(c => ({
    name: c,
    slug: cityToSlug(c),
    count: mockUsers.filter(u => u.city === c).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Знакомства по городам России — ВДрузьях"
        description="Выберите город для знакомств. Москва, Санкт-Петербург, Казань и другие города. Найдите людей рядом на ВДрузьях."
        canonical="https://mutual-connections.lovable.app/cities"
      />

      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">В</span>
            </div>
            <span className="text-lg font-bold text-foreground">ВДрузьях</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/auth/login"><Button variant="ghost" size="sm">Войти</Button></Link>
            <Link to="/auth/register"><Button size="sm">Регистрация</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Знакомства по городам</h1>
          <p className="text-muted-foreground mt-2">Выберите город, чтобы найти людей рядом</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cityCounts.map(c => (
            <Link key={c.slug} to={`/dating/${c.slug}`} className="bg-card rounded-lg border border-border p-5 hover:shadow-elevated transition-shadow flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{c.name}</h2>
                <p className="text-sm text-muted-foreground">{c.count} анкет</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Знакомства по возрасту</h2>
          <div className="flex flex-wrap gap-3">
            {["18-22", "23-27", "28-32", "33-37", "38-45", "45-55"].map(r => (
              <Link key={r} to={`/dating/age/${r}`}>
                <Button variant="outline" size="sm">{r} лет</Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
