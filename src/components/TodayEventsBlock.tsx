import { useMemo } from "react";
import { CalendarDays, MapPin, Sparkles, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { mockEvents, mockUsers } from "@/lib/mock-data";

const covers = [
  "https://images.unsplash.com/photo-1529543544282-ea99407407db?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=200&h=200&fit=crop",
];

export default function TodayEventsBlock() {
  const events = useMemo(() => mockEvents.slice(0, 3), []);

  if (events.length === 0) return null;

  return (
    <div className="premium-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-[14px] font-semibold text-foreground">События сегодня</span>
          <Badge variant="secondary" className="text-[10px]">{events.length}</Badge>
        </div>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <Link key={e.id} to="/events" className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all duration-200 group">
            <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0">
              <img src={covers[i % covers.length]} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{e.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />{e.time}
                <MapPin className="h-3 w-3 ml-1" />{e.city}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex -space-x-1">
                {mockUsers.slice(i * 2, i * 2 + 2).map((u, j) => (
                  <Avatar key={u.id} className="h-5 w-5 border border-card" style={{ zIndex: 2 - j }}>
                    <AvatarImage src={u.avatar} className="object-cover" />
                    <AvatarFallback className="text-[7px]">{u.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{e.attendees}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
