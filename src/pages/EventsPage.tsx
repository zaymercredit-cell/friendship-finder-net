import { useState, useMemo, useEffect } from "react";
import { useSessionState, readSessionState, writeSessionState } from "@/lib/session-state";
import { useAuth } from "@/contexts/AuthContext";
import { useMeetups, useMeetupParticipants, useJoinMeetup, useLeaveMeetup } from "@/hooks/useMeetups";
import { CreateMeetupDialog } from "@/pages/MeetupsPage";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
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

export default function EventsPage() {
  const { profile } = useAuth();
  const { data: meetups = [], isLoading, isError, refetch } = useMeetups();
  const events = useMemo(() => (meetups || []).map(m => ({ id: m.id, title: m.title, description: m.description || "", date: format(new Date(m.start_time), "d MMMM yyyy", { locale: ru }), time: format(new Date(m.start_time), "HH:mm"), city: m.city || "", tags: m.tags || [], attendees: 0, isGoing: false, cover: m.cover_url || undefined, detailsPath: `/meetups/${m.id}`, factual: true })), [meetups]);
  const [search, setSearch] = useSessionState<string>("events:search", "");
  const [activeCategory, setActiveCategory] = useSessionState<string>("events:cat", "all");

  useEffect(() => {
    const y = readSessionState<number>("events:scroll", 0);
    if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        writeSessionState("events:scroll", window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      writeSessionState("events:scroll", window.scrollY);
    };
  }, []);

  const filtered = useMemo(() => {
    let result = events;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (activeCategory === "popular") result = [...result].sort((a, b) => b.attendees - a.attendees);
    if (activeCategory === "nearby") result = result.filter(e => e.city === profile?.city);
    if (activeCategory === "interests") {
      result = result.filter(e => e.tags.some(t => (profile?.interests || []).includes(t)));
    }
    if (activeCategory === "dating") result = result.filter(e => e.tags.some(t => ["Знакомства", "Dating", "Общение"].includes(t)));
    return result;
  }, [events, search, activeCategory, profile]);

  const featuredEvent = filtered[0];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">События</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Встречайтесь и знакомьтесь вживую</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/meetups">
            <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
              <CalendarDays className="h-4 w-4" />Встречи
            </Button>
          </Link>
          <CreateMeetupDialog />
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

      {isLoading && <PageSkeleton />}
      {isError && <div><p className="text-destructive">Не удалось загрузить события</p><Button variant="outline" onClick={() => refetch()}>Повторить</Button></div>}
      {/* Events grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {filtered.map(event => (
          <PersistedEvent key={event.id} event={event} />
        ))}
      </div>

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Событий не найдено</h3>
          <p className="text-sm text-muted-foreground">Создайте своё событие или измените поиск</p>
        </div>
      )}
    </div>
  );
}
function PersistedEvent({ event }: { event: EventCardData }) {
  const { user } = useAuth();
  const participants = useMeetupParticipants(event.id);
  const join = useJoinMeetup();
  const leave = useLeaveMeetup();
  const isGoing = participants.data?.some(p => p.user_id === user?.id) || false;
  return <div>
    <EventCard event={{ ...event, attendees: participants.data?.length || 0, isGoing }}
      actionDisabled={participants.isLoading || participants.isError || join.isPending || leave.isPending}
      onToggleGoing={() => isGoing ? leave.mutate(event.id) : join.mutate(event.id)} />
    {participants.isError && <div className="mt-2"><p className="text-destructive text-sm">Не удалось проверить участие</p><Button variant="outline" size="sm" onClick={() => participants.refetch()}>Повторить</Button></div>}
  </div>;
}
