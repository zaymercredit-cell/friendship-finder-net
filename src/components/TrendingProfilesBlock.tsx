import { useMemo } from "react";
import { mockUsers, calculateMatchScore, currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Circle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrendingProfilesBlock() {
  const trending = useMemo(() => {
    // Simulate trending: users with most "activity" (online + high match score)
    return mockUsers
      .filter(u => u.id !== currentUser.id)
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u), trending: Math.random() * 100 }))
      .sort((a, b) => b.trending - a.trending)
      .slice(0, 5);
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-[14px] font-semibold text-foreground">Популярные профили</span>
        <Badge variant="secondary" className="text-[10px]">Trending</Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {trending.map(({ user: u, score }) => (
          <Link key={u.id} to={`/profile/${u.username}`} className="shrink-0 text-center group">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-primary/15 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={u.avatar} alt={u.name} />
                <AvatarFallback>{u.name[0]}</AvatarFallback>
              </Avatar>
              {u.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
              )}
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded-md leading-none">{score}%</div>
            </div>
            <p className="text-[11px] text-foreground mt-1 font-medium truncate w-14">{u.name.split(" ")[0]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
