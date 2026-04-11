import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, TrendingUp, Zap, Calendar, MessageCircle, ArrowRight, Share2, UserPlus, Flame } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  description: string;
  cover: string;
  tags: string[];
  membersCount: number;
  postsCount: number;
}

interface Props {
  community: Community;
}

export default function CommunityCard({ community }: Props) {
  const memberAvatars = mockUsers.slice(0, 5);
  const isPopular = community.membersCount > 500;
  const isActive = community.postsCount > 50;
  const isNew = parseInt(community.id.replace(/\D/g, '') || '0') > 80;
  const weeklyActivity = Math.floor(Math.random() * 30 + 5);
  const growthPercent = Math.floor(Math.random() * 25 + 3);
  const hasUpcomingEvent = Math.random() > 0.6;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/communities/${community.id}`);
    toast.success("Ссылка скопирована!");
  };

  const handleInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast("Пригласите друзей в сообщество!", { description: "Функция скоро будет доступна" });
  };

  return (
    <Link to={`/communities/${community.id}`} className="block group">
      <div className="premium-card overflow-hidden hover:-translate-y-0.5">
        {/* Cover image with overlay */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={community.cover}
            alt={community.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {isPopular && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-warning/90 text-warning-foreground px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  <TrendingUp className="h-2.5 w-2.5" />Популярное
                </span>
              )}
              {isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-success/90 text-success-foreground px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  <Zap className="h-2.5 w-2.5" />Активное
                </span>
              )}
              {isNew && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-sm">
                  Новое
                </span>
              )}
            </div>
            {hasUpcomingEvent && (
              <span className="text-[9px] font-bold bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <Calendar className="h-2.5 w-2.5" />Скоро встреча
              </span>
            )}
          </div>

          {/* Title overlay on cover */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-[16px] font-bold text-white leading-tight drop-shadow-md group-hover:text-primary-foreground transition-colors">{community.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{community.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {community.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md font-medium hover:bg-primary/10 hover:text-primary transition-colors">{tag}</span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {community.membersCount.toLocaleString()} участников
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {weeklyActivity} за неделю
            </span>
            {growthPercent > 10 && (
              <span className="flex items-center gap-1 text-success font-medium">
                <Flame className="h-3 w-3" />
                +{growthPercent}%
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              {memberAvatars.map((u, i) => (
                <Avatar key={u.id} className="h-7 w-7 border-2 border-card ring-0" style={{ zIndex: 5 - i }}>
                  <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                  <AvatarFallback className="text-[9px]">{u.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {community.membersCount > 5 && (
                <div className="h-7 w-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground" style={{ zIndex: 0 }}>
                  +{community.membersCount - 5}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground" onClick={handleShare}>
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground" onClick={handleInvite}>
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" className="h-8 text-[11px] rounded-xl px-4 font-semibold shadow-sm gap-1.5 group-hover:shadow-md transition-all active:scale-[0.97]">
                Вступить
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
