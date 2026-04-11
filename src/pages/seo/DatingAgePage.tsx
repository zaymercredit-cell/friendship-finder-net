import { useParams, Link } from "react-router-dom";
import { mockUsers } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function DatingAgePage() {
  const { range } = useParams();
  const [minStr, maxStr] = (range || "20-25").split("-");
  const minAge = parseInt(minStr) || 18;
  const maxAge = parseInt(maxStr) || 25;
  const users = mockUsers.filter(u => u.age && u.age >= minAge && u.age <= maxAge).slice(0, 30);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`Знакомства ${minAge}–${maxAge} лет — ВДрузьях`}
        description={`Найдите людей в возрасте от ${minAge} до ${maxAge} лет для знакомства. ${users.length}+ анкет на ВДрузьях.`}
        canonical={`https://mutual-connections.lovable.app/dating/age/${range}`}
      />

      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Знакомства: {minAge}–{maxAge} лет
          </h1>
          <p className="text-muted-foreground mt-2">{users.length} анкет в возрасте {minAge}–{maxAge} лет</p>
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
                <p className="text-xs text-muted-foreground">{u.city}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.interests.slice(0, 3).map(i => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{i}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="bg-primary rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Начните знакомиться</h2>
          <p className="text-primary-foreground/80 mb-5">Создайте анкету и найдите людей вашего возраста</p>
          <Link to="/auth/register"><Button variant="secondary" size="lg">Создать анкету</Button></Link>
        </section>
      </div>
    </div>
  );
}
