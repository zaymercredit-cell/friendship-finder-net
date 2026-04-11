import { useState, useMemo } from "react";
import { mockEvents, mockUsers, currentUser } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, CalendarDays, MapPin, Sparkles, Filter, TrendingUp, Users, Clock, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import EventCard, { type EventCardData } from "@/components/EventCard";
import AiEventRecommendations from "@/components/AiEventRecommendations";

const categories = [
  { key: "all", label: "Все", icon: CalendarDays },
  { key: "popular", label: "Популярные", icon: TrendingUp },
  { key: "nearby", label: "Рядом", icon: MapPin },
  { key: "interests", label: "По интересам", icon: Sparkles },
  { key: "dating", label: "Знакомства", icon: Users },
];

// Extended mock events for richer content
const extendedEvents: EventCardData[] = [
  ...mockEvents,
  { id: "e9", title: "Speed Dating: 25–35 лет", description: "Формат быстрых знакомств в уютном баре. 15 мини-свиданий за один вечер!", date: "23 марта 2026", time: "19:00", city: "Москва", tags: ["Знакомства", "Dating"], attendees: 30, isGoing: false, vibe: "romantic" },
  { id: "e10", title: "Утренняя йога в парке", description: "Начните день с йоги на свежем воздухе. Коврики предоставляются.", date: "24 марта 2026", time: "07:00", city: "Сочи", tags: ["Йога", "Здоровье"], attendees: 16, isGoing: false, vibe: "chill" },
  { id: "e11", title: "Хакатон для разработчиков", description: "48 часов кодинга, менторство и призы. Команды формируются на месте.", date: "25 марта 2026", time: "10:00", city: "Казань", tags: ["IT", "Хакатон"], attendees: 45, isGoing: false, vibe: "active" },
  { id: "e12", title: "Винный вечер: дегустация", description: "Знакомство с миром вин: 5 сортов, сырная тарелка и приятная компания.", date: "26 марта 2026", time: "18:30", city: "Санкт-Петербург", tags: ["Вино", "Общение"], attendees: 20, isGoing: false, vibe: "romantic" },
  { id: "e13", title: "Фотовыставка: Россия глазами путешественников", description: "Авторские фотографии из 30 регионов России. Встреча с авторами.", date: "27 марта 2026", time: "16:00", city: "Москва", tags: ["Фотография", "Искусство"], attendees: 55, isGoing: false, vibe: "creative" },
  { id: "e14", title: "Совместная велопрогулка", description: "Маршрут 25 км по набережной. Остановки с фотосессиями!", date: "28 марта 2026", time: "09:00", city: "Екатеринбург", tags: ["Велоспорт", "Спорт"], attendees: 22, isGoing: false, vibe: "active" },
  { id: "e15", title: "Мастер-класс по живописи", description: "Рисуем маслом городской пейзаж. Все материалы включены.", date: "29 марта 2026", time: "14:00", city: "Краснодар", tags: ["Искусство", "Мастер-класс"], attendees: 12, isGoing: false, vibe: "creative" },
  { id: "e16", title: "Книжный клуб: обсуждение", description: "Обсуждаем «Мастер и Маргарита» за чашкой кофе.", date: "30 марта 2026", time: "17:00", city: "Новосибирск", tags: ["Книги", "Общение"], attendees: 10, isGoing: false, vibe: "chill" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventCardData[]>(extendedEvents);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleGoing = (id: string) => {
    setEvents(events.map(e =>
      e.id === id ? { ...e, isGoing: !e.isGoing, attendees: e.isGoing ? e.attendees - 1 : e.attendees + 1 } : e
    ));
  };

  const filtered = useMemo(() => {
    let result = events;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (activeCategory === "popular") result = [...result].sort((a, b) => b.attendees - a.attendees);
    if (activeCategory === "nearby") result = result.filter(e => e.city === currentUser.city);
    if (activeCategory === "interests") {
      result = result.filter(e => e.tags.some(t => currentUser.interests.includes(t)));
    }
    if (activeCategory === "dating") result = result.filter(e => e.tags.some(t => ["Знакомства", "Dating", "Общение"].includes(t)));
    return result;
  }, [events, search, activeCategory]);

  const featuredEvent = filtered[0];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">События</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Встречайтесь и знакомьтесь вживую</p>
        </div>
        <div className="flex gap-2">
          <Link to="/meetups">
            <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
              <CalendarDays className="h-4 w-4" />Встречи
            </Button>
          </Link>
          <Button size="sm" className="gap-1.5 text-[12px]">
            <Plus className="h-4 w-4" />Создать
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Найти событие..."
          className="pl-9 bg-card border-border/60 text-[14px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* AI Recommendations */}
      <AiEventRecommendations />

      {/* Smart Event Suggestion */}
      <div className="premium-card p-4 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04] border-primary/15">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">Мини-событие для вас</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              3 человека рядом любят кофе и прогулки. AI предлагает встречу сегодня в 16:00.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-1.5">
                {mockUsers.slice(2, 5).map((u, i) => (
                  <div key={u.id} className="h-6 w-6 rounded-full border-2 border-card overflow-hidden" style={{ zIndex: 3 - i }}>
                    <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <Button size="sm" className="h-7 text-[11px] rounded-lg px-3 gap-1">
                <Sparkles className="h-3 w-3" />Присоединиться
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {filtered.map(event => (
          <EventCard key={event.id} event={event} onToggleGoing={toggleGoing} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Событий не найдено</h3>
          <p className="text-sm text-muted-foreground">Создайте своё событие или измените поиск</p>
        </div>
      )}
    </div>
  );
}