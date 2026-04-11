import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Check, Clock, Sparkles, ArrowRight, Share2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUsers } from "@/lib/mock-data";
import { toast } from "sonner";

export interface EventCardData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  city: string;
  tags: string[];
  attendees: number;
  isGoing: boolean;
  cover?: string;
  vibe?: string;
  matchCount?: number;
}

const vibeBadges: Record<string, { label: string; color: string }> = {
  romantic: { label: "💕 Романтика", color: "bg-pink-500/10 text-pink-600" },
  active: { label: "🏃 Активный", color: "bg-orange-500/10 text-orange-600" },
  chill: { label: "☕ Спокойный", color: "bg-sky-500/10 text-sky-600" },
  social: { label: "🎉 Общение", color: "bg-violet-500/10 text-violet-600" },
  creative: { label: "🎨 Творческий", color: "bg-emerald-500/10 text-emerald-600" },
};

const defaultCovers = [
  "https://images.unsplash.com/photo-1529543544282-ea99407407db?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=300&fit=crop",
];

function getTimeBadge(date: string, time: string): { label: string; color: string } | null {
  // Simple mock logic for timing badges
  const hour = parseInt(time.split(":")[0] || "12");
  const isToday = date.includes("сегодня") || Math.random() > 0.7;
  const isSoon = hour - new Date().getHours() < 3 && hour - new Date().getHours() > 0;
  
  if (isToday && isSoon) return { label: "⚡ Скоро", color: "bg-destructive/90 text-destructive-foreground" };
  if (isToday) return { label: "📅 Сегодня", color: "bg-warning/90 text-warning-foreground" };
  return null;
}

interface Props {
  event: EventCardData;
  onToggleGoing?: (id: string) => void;
  compact?: boolean;
}

export default function EventCard({ event, onToggleGoing, compact }: Props) {
  const cover = event.cover || defaultCovers[parseInt(event.id.replace(/\D/g, '') || '0') % defaultCovers.length];
  const vibe = event.vibe || ["romantic", "active", "chill", "social", "creative"][parseInt(event.id.replace(/\D/g, '') || '0') % 5];
  const vibeInfo = vibeBadges[vibe] || vibeBadges.social;
  const matchCount = event.matchCount ?? Math.floor(Math.random() * 8 + 1);
  const attendeeAvatars = mockUsers.slice(parseInt(event.id.replace(/\D/g, '') || '0') % 20, parseInt(event.id.replace(/\D/g, '') || '0') % 20 + 4);
  const timeBadge = getTimeBadge(event.date, event.time);
  const isPopular = event.attendees > 15;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
    toast.success("Ссылка на событие скопирована!");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group cursor-pointer active:scale-[0.98]">
        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
          <img src={cover} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{event.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />{event.time}
            <MapPin className="h-3 w-3 ml-1" />{event.city}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary" className="text-[10px] shrink-0">{event.attendees}</Badge>
          {timeBadge && <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-md", timeBadge.color)}>{timeBadge.label}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden group hover:-translate-y-0.5">
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={cover}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm", vibeInfo.color)}>
              {vibeInfo.label}
            </span>
            {timeBadge && (
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm", timeBadge.color)}>
                {timeBadge.label}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {matchCount > 0 && (
              <span className="text-[10px] font-bold bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {matchCount} совмест.
              </span>
            )}
            {isPopular && (
              <span className="text-[9px] font-bold bg-warning/90 text-warning-foreground px-2 py-0.5 rounded-md backdrop-blur-sm">
                🔥 Популярное
              </span>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <h3 className="text-[16px] font-bold text-white leading-tight drop-shadow-md">{event.title}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-[12px] text-white/80">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{event.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

        {/* AI "Why this fits you" */}
        {matchCount > 3 && (
          <div className="flex items-center gap-2 bg-primary/[0.04] rounded-lg px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[11px] text-primary font-medium">Подходит вам — {matchCount} общих интересов с участниками</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {event.tags.map(tag => (
            <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md font-medium hover:bg-primary/10 hover:text-primary transition-colors">
              {tag}
            </span>
          ))}
        </div>

        {/* Attendees row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {attendeeAvatars.map((u, i) => (
                <Avatar key={u.id} className="h-7 w-7 border-2 border-card" style={{ zIndex: 4 - i }}>
                  <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                  <AvatarFallback className="text-[9px]">{u.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {event.attendees > 4 && (
                <div className="h-7 w-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground" style={{ zIndex: 0 }}>
                  +{event.attendees - 4}
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />{event.attendees} участников
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full text-muted-foreground" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Action */}
        <Button
          size="sm"
          variant={event.isGoing ? "default" : "secondary"}
          className={cn(
            "w-full h-9 text-[12px] font-semibold rounded-xl gap-1.5 transition-all active:scale-[0.97]",
            event.isGoing && "shadow-sm"
          )}
          onClick={(e) => { e.stopPropagation(); onToggleGoing?.(event.id); }}
        >
          {event.isGoing ? (
            <><Check className="h-3.5 w-3.5" />Вы идёте!</>
          ) : (
            <><ArrowRight className="h-3.5 w-3.5" />Хочу пойти</>
          )}
        </Button>
      </div>
    </div>
  );
}
