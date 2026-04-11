import { useParams, Link } from "react-router-dom";
import { mockEvents } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export function eventToSlug(title: string, id: string): string {
  return id;
}

export default function EventPage() {
  const { slug } = useParams();
  const event = mockEvents.find(e => e.id === slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Событие не найдено</p>
          <Link to="/"><Button variant="outline" className="mt-4">На главную</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`${event.title} — событие на ВДрузьях`}
        description={`${event.description} ${event.date}, ${event.time}, ${event.city}. ${event.attendees} участников.`}
        canonical={`https://mutual-connections.lovable.app/events/${slug}`}
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

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <span>{event.date} · {event.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.city}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.attendees} участников</span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">{event.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {event.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">Хотите присоединиться?</p>
            <Link to="/auth/register"><Button className="gap-1.5">Создать анкету и участвовать</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
