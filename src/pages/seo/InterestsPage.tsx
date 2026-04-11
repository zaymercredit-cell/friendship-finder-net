import { Link } from "react-router-dom";
import { allInterests, mockUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { interestToSlug } from "./DatingInterestPage";

export default function InterestsPage() {
  const items = allInterests.map(i => ({
    name: i,
    slug: interestToSlug(i),
    count: mockUsers.filter(u => u.interests.includes(i)).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Знакомства по интересам — ВДрузьях"
        description="Найдите единомышленников по интересам: путешествия, спорт, музыка, кино, кулинария и другие. Знакомства на ВДрузьях."
        canonical="https://mutual-connections.lovable.app/interests"
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary" /> Знакомства по интересам
          </h1>
          <p className="text-muted-foreground mt-2">Выберите интерес, чтобы найти единомышленников</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Link key={item.slug} to={`/dating/interests/${item.slug}`} className="bg-card rounded-lg border border-border p-5 hover:shadow-elevated transition-shadow">
              <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
              <p className="text-sm text-muted-foreground">{item.count} человек</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
