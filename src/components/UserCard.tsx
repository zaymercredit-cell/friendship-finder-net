import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/mock-data";
import { currentUser } from "@/lib/mock-data";
import { Heart, MessageCircle, MapPin, Users, CheckCircle2, Target, User as UserIcon, MoreHorizontal, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import MoodBadge from "@/components/MoodBadge";
import VipBadge from "@/components/VipBadge";
import ConversationPotential from "@/components/ConversationPotential";
import InterestMatchBadge from "@/components/InterestMatchBadge";
import TrustBadgeInline from "@/components/trust/TrustBadgeInline";
import GrowthProofBadges, { getRandomGrowthBadges } from "@/components/GrowthProofBadges";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";
import { toast } from "sonner";

export default function UserCard({ user, score, chemistry, conversationScore, mood, isVip }: {
  user: User;
  score?: number;
  chemistry?: number;
  conversationScore?: number;
  mood?: string;
  isVip?: boolean;
}) {
  const navigate = useNavigate();
  const scoreColor = score && score >= 80 ? "from-success to-success" : score && score >= 60 ? "from-primary to-accent" : "from-muted-foreground/80 to-muted-foreground/60";
  const chemScore = chemistry || Math.floor(Math.random() * 40 + 50);
  const convScore = conversationScore || Math.floor(Math.random() * 40 + 45);
  const userMood = mood || (Math.random() > 0.6 ? ["chatty", "walk", "open", "coffee", "evening"][Math.floor(Math.random() * 5)] : undefined);

  const commonInterests = useMemo(() => {
    return user.interests.filter(i => currentUser.interests.includes(i));
  }, [user.interests]);

  const growthBadges = useMemo(() => getRandomGrowthBadges(user.id), [user.id]);

  // Activity level based on user data
  const activityLevel = useMemo(() => {
    const hash = user.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    if (hash % 5 === 0) return { label: "Очень активен", color: "text-success", dots: 5 };
    if (hash % 3 === 0) return { label: "Активен", color: "text-primary", dots: 4 };
    return { label: "Иногда заходит", color: "text-muted-foreground", dots: 2 };
  }, [user.id]);

  return (
    <div className="rounded-2xl overflow-hidden group relative bg-card border border-border/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-0.5">
      {/* Photo */}
      <Link to={`/profile/${user.username}`} className="block relative aspect-[3/4] overflow-hidden">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {user.isOnline && (
              <div className="flex items-center gap-1.5 bg-card/70 backdrop-blur-md rounded-full text-[11px] font-medium px-2.5 py-1 text-foreground">
                <span className="h-2 w-2 rounded-full bg-success pulse-dot" />
                онлайн
              </div>
            )}
            {userMood && <MoodBadge mood={userMood} compact className="backdrop-blur-md bg-card/60 rounded-full" />}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {score && (
              <div className={`bg-gradient-to-r ${scoreColor} text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1`}>
                <Sparkles className="h-2.5 w-2.5" />
                {score}%
              </div>
            )}
            {chemScore >= 70 && (
              <div className="bg-gradient-to-r from-destructive/90 to-destructive/70 text-destructive-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Zap className="h-2.5 w-2.5" />
                {chemScore}%
              </div>
            )}
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[18px] font-bold text-white leading-tight drop-shadow-md">
              {user.name.split(" ")[0]}{user.age ? `, ${user.age}` : ""}
            </h3>
            {isVip && <VipBadge size="sm" />}
            {user.isOnline && <CheckCircle2 className="h-4 w-4 text-white/80 fill-white/20" />}
            <ShieldCheck className="h-3.5 w-3.5 text-white/70" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[12px] text-white/80 flex items-center gap-1 drop-shadow-sm">
              <MapPin className="h-3 w-3" />
              {user.city}
            </p>
            <TrustBadgeInline isVerified={user.isOnline} trustScore={score} compact />
          </div>
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
        {/* Activity indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {growthBadges.length > 0 && <GrowthProofBadges badges={growthBadges} compact />}
          </div>
          <div className="flex items-center gap-1" title={activityLevel.label}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i < activityLevel.dots ? "bg-primary" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>

        {user.about && (
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{user.about}</p>
        )}

        {commonInterests.length > 0 && <InterestMatchBadge commonInterests={commonInterests} />}

        <div className="flex flex-wrap gap-1.5">
          {user.interests.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors",
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

        <div className="flex items-center gap-2">
          {convScore >= 60 && <ConversationPotential score={convScore} compact />}
          {user.communicationGoals && user.communicationGoals.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Target className="h-3 w-3 text-primary/40" />
              <span className="truncate">{user.communicationGoals[0]}</span>
            </div>
          )}
        </div>

        {user.mutualFriends && user.mutualFriends > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {user.mutualFriends} общих друзей
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" className="flex-1 h-9 text-[12px] font-semibold gap-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow active:scale-[0.97]"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast("❤️ Симпатия отправлена"); }}>
            <Heart className="h-3.5 w-3.5" />
            Нравится
          </Button>
          <Button size="sm" variant="secondary" className="h-9 w-9 p-0 rounded-full active:scale-[0.95]"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/profile/${user.username}`); }}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link to={`/profile/${user.username}`} className="gap-2 text-[12px]">
                  <UserIcon className="h-3.5 w-3.5" />Профиль
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
