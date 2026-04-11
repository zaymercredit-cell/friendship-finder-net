import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockUsers, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, MessageCircle, Sparkles } from "lucide-react";
import MoodBadge from "./MoodBadge";

export default function InstantMatchBlock() {
  const navigate = useNavigate();

  const instantMatches = useMemo(() => {
    return mockUsers
      .filter(u => u.isOnline && u.id !== currentUser.id)
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u) }))
      .filter(({ score }) => score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, []);

  if (instantMatches.length === 0) return null;

  return (
    <div className="premium-card p-4 bg-gradient-to-r from-primary/[0.03] to-accent/[0.02]">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <span className="text-[14px] font-semibold text-foreground">Быстрое знакомство</span>
          <p className="text-[11px] text-muted-foreground">Онлайн и высокая совместимость</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {instantMatches.map(({ user: u, score }) => (
          <div
            key={u.id}
            className="relative bg-secondary/40 rounded-xl p-3 hover:bg-secondary/60 transition-colors cursor-pointer group"
            onClick={() => navigate(`/profile/${u.username}`)}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Avatar className="h-11 w-11 ring-2 ring-success/30">
                  <AvatarImage src={u.avatar} className="object-cover" />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground truncate">{u.name.split(" ")[0]}, {u.age}</p>
                <p className="text-[10px] text-muted-foreground truncate">{u.city}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[11px] font-semibold text-primary">{score}%</span>
              </div>
              <Button
                size="sm"
                className="h-7 text-[10px] gap-1 rounded-lg px-2.5"
                onClick={(e) => { e.stopPropagation(); navigate(`/messages`); }}
              >
                <MessageCircle className="h-3 w-3" />
                Написать
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
