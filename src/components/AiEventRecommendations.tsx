import { useMemo } from "react";
import { Sparkles, CalendarDays, Users, MapPin, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { mockUsers, mockEvents } from "@/lib/mock-data";

export default function AiEventRecommendations() {
  const suggestions = useMemo(() => {
    // AI-like suggestions based on mock data
    return [
      {
        id: "ai-1",
        type: "smart" as const,
        title: "Кофе-прогулка",
        reason: "3 человека рядом любят кофе и прогулки",
        users: mockUsers.slice(0, 3),
        city: "Москва",
        time: "Сегодня, 15:00",
      },
      {
        id: "ai-2",
        type: "match" as const,
        title: "Настольные игры",
        reason: "5 человек с высокой совместимостью",
        event: mockEvents[3],
        matchCount: 5,
      },
      {
        id: "ai-3",
        type: "smart" as const,
        title: "Вечерняя прогулка",
        reason: "4 человека хотят общаться прямо сейчас",
        users: mockUsers.slice(5, 9),
        city: "Санкт-Петербург",
        time: "Сегодня, 19:00",
      },
    ];
  }, []);

  return (
    <div className="premium-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-[14px] font-semibold text-foreground">AI рекомендует</span>
            <p className="text-[11px] text-muted-foreground">Подобрано по вашим интересам</p>
          </div>
        </div>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button>
        </Link>
      </div>

      <div className="space-y-2.5">
        {suggestions.map((s) => (
          <Link
            key={s.id}
            to="/events"
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              {s.type === "smart" ? (
                <Zap className="h-4.5 w-4.5 text-primary" />
              ) : (
                <CalendarDays className="h-4.5 w-4.5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{s.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary/60" />
                {s.reason}
              </p>
              {"city" in s && s.city && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />{s.city}
                  <span>· {s.time}</span>
                </div>
              )}
            </div>
            {"users" in s && s.users && (
              <div className="flex -space-x-1.5 shrink-0">
                {s.users.slice(0, 3).map((u, i) => (
                  <Avatar key={u.id} className="h-6 w-6 border-2 border-card" style={{ zIndex: 3 - i }}>
                    <AvatarImage src={u.avatar} className="object-cover" />
                    <AvatarFallback className="text-[8px]">{u.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}