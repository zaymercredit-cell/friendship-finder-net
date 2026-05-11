import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Check, Clock, ArrowRight, Share2, Sparkles, Shield } from "lucide-react";
import { toast } from "sonner";
import { memo } from "react";
import SmartImage from "@/components/ui/smart-image";

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

const defaultCovers = [
  "https://images.unsplash.com/photo-1529543544282-ea99407407db?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=300&fit=crop",
];

function pseudoScore(id: string, base: number, range: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return base + (Math.abs(hash) % range);
}

interface Props {
  event: EventCardData;
  onToggleGoing?: (id: string) => void;
  compact?: boolean;
}

export default memo(function EventCard({ event, onToggleGoing, compact }: Props) {
  const cover = event.cover || defaultCovers[parseInt(event.id.replace(/\D/g, '') || '0') % defaultCovers.length];
  const matchPeople = pseudoScore(event.id, 2, 8);
  const socialEnergy = pseudoScore(event.id + "en", 50, 45);
  const isTrustedOrg = pseudoScore(event.id + "tr", 0, 10) > 5;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
    toast.success("Ссылка на событие скопирована!");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors duration-150 cursor-pointer">
        <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
          <SmartImage src={cover} alt={event.title} wrapperClassName="h-full w-full" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{event.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />{event.time}
            <MapPin className="h-3 w-3 ml-1" />{event.city}
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">{event.attendees}</Badge>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden cv-auto-tall">
      {/* Cover */}
      <div className="relative h-44">
        <SmartImage
          src={cover}
          alt={event.title}
          wrapperClassName="absolute inset-0 h-full w-full"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {isTrustedOrg && (
              <div className="flex items-center gap-1 bg-card/80 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                <Shield className="h-2.5 w-2.5 text-success" />Проверенный
              </div>
            )}
          </div>
          {socialEnergy >= 80 && (
            <div className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              🔥 Высокая энергия
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <h3 className="text-[16px] font-bold text-white leading-tight">{event.title}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-[12px] text-white/80">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{event.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {event.tags.map(tag => (
            <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md font-medium">{tag}</span>
          ))}
        </div>

        {/* Match people hint */}
        {matchPeople >= 3 && (
          <div className="flex items-center gap-1.5 bg-primary/5 rounded-lg px-2.5 py-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] text-primary font-medium">{matchPeople} совместимых людей идут</span>
          </div>
        )}

        {/* Attendees row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />{event.attendees} участников
          </span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full text-muted-foreground" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Action */}
        <Button
          size="sm"
          variant={event.isGoing ? "default" : "secondary"}
          className="w-full h-9 text-[12px] font-semibold rounded-xl gap-1.5"
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
});
