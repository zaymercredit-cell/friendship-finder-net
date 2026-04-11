import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/mock-data";
import { currentUser } from "@/lib/mock-data";
import { Heart, MessageCircle, MapPin, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMemo, memo } from "react";
import { toast } from "sonner";

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
          </div>
          {score && (
            <div className="bg-primary text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              {score}%
            </div>
          )}
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
          {commonInterests.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
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
