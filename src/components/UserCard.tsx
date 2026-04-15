import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/mock-data";
import { currentUser } from "@/lib/mock-data";
import { Heart, MessageCircle, MapPin, Sparkles, Shield, Zap, Coffee } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMemo, memo } from "react";
import { toast } from "sonner";

// Deterministic pseudo-random based on user ID
function pseudoScore(id: string, base: number, range: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return base + (Math.abs(hash) % range);
}

export default memo(function UserCard({ user, score }: {
  user: User;
  score?: number;
  chemistry?: number;
  conversationScore?: number;
  mood?: string;
  isVip?: boolean;
}) {
  const navigate = useNavigate();

  const commonInterests = useMemo(() => {
    return user.interests.filter(i => currentUser.interests.includes(i));
  }, [user.interests]);

  const chemistry = useMemo(() => pseudoScore(user.id, 55, 40), [user.id]);
  const conversationEase = useMemo(() => pseudoScore(user.id + "conv", 50, 45), [user.id]);
  const trustLevel = useMemo(() => pseudoScore(user.id + "trust", 60, 35), [user.id]);

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/40 card-shadow hover:card-shadow-hover transition-shadow duration-150">
      {/* Photo */}
      <Link to={`/profile/${user.username}`} className="block relative aspect-[3/4] overflow-hidden">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {user.isOnline && (
              <div className="flex items-center gap-1.5 bg-card/80 rounded-full text-[11px] font-medium px-2.5 py-1 text-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
                онлайн
              </div>
            )}
            {trustLevel >= 80 && (
              <div className="flex items-center gap-1 bg-card/80 rounded-full text-[10px] font-medium px-2 py-0.5 text-foreground">
                <Shield className="h-2.5 w-2.5 text-success" />
                Доверие
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            {score && (
              <div className="bg-primary text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                {score}%
              </div>
            )}
            {chemistry >= 80 && (
              <div className="bg-rose-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5" />
                Химия
              </div>
            )}
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <h3 className="text-[18px] font-bold text-white leading-tight">
            {user.name.split(" ")[0]}{user.age ? `, ${user.age}` : ""}
          </h3>
          <p className="text-[12px] text-white/80 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {user.city}
          </p>
          {/* Conversation ease hint */}
          {conversationEase >= 75 && (
            <div className="flex items-center gap-1 mt-1">
              <Coffee className="h-3 w-3 text-white/70" />
              <span className="text-[10px] text-white/70 font-medium">Легко начать разговор</span>
            </div>
          )}
          {commonInterests.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="h-3 w-3 text-white/70" />
              <span className="text-[11px] text-white/80 font-medium">
                {commonInterests.length} общ. интерес{commonInterests.length === 1 ? "" : commonInterests.length < 5 ? "а" : "ов"}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        {user.about && (
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{user.about}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {user.interests.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full font-medium",
                commonInterests.includes(tag)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground bg-secondary/60"
              )}
            >{tag}</span>
          ))}
          {user.interests.length > 4 && (
            <span className="text-[11px] text-muted-foreground/40 self-center">+{user.interests.length - 4}</span>
          )}
        </div>

        {/* AI micro-signals */}
        {user.communicationGoals && user.communicationGoals.length > 0 && (
          <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
            🎯 {user.communicationGoals[0]}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" className="flex-1 h-9 text-[12px] font-semibold gap-1.5 rounded-full"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast("❤️ Симпатия отправлена"); }}>
            <Heart className="h-3.5 w-3.5" />
            Нравится
          </Button>
          <Button size="sm" variant="secondary" className="h-9 w-9 p-0 rounded-full"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/profile/${user.username}`); }}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
