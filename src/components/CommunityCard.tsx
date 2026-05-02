import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, ArrowRight, Share2, CalendarDays, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { memo } from "react";
import SmartImage from "@/components/ui/smart-image";

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

function pseudoScore(id: string, base: number, range: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return base + (Math.abs(hash) % range);
}

export default memo(function CommunityCard({ community }: Props) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/communities/${community.id}`);
    toast.success("Ссылка скопирована!");
  };

  const onlineNow = pseudoScore(community.id, 3, 25);
  const matchFit = pseudoScore(community.id + "fit", 60, 35);
  const hasUpcomingEvent = pseudoScore(community.id + "ev", 0, 10) > 4;

  return (
    <Link to={`/communities/${community.id}`} className="block">
      <div className="premium-card overflow-hidden">
        {/* Cover image */}
        <div className="relative h-40">
          <SmartImage
            src={community.cover}
            alt={community.name}
            wrapperClassName="absolute inset-0 h-full w-full"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {matchFit >= 80 && (
              <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" />Подходит вам
              </div>
            )}
            {community.postsCount > 3000 && (
              <div className="flex items-center gap-1 bg-card/80 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                <TrendingUp className="h-2.5 w-2.5 text-primary" />Популярное
              </div>
            )}
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-[16px] font-bold text-white leading-tight">{community.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{community.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {community.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md font-medium">{tag}</span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {community.membersCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {community.postsCount}
            </span>
            <span className="flex items-center gap-1 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {onlineNow} онлайн
            </span>
          </div>

          {/* Upcoming event hint */}
          {hasUpcomingEvent && (
            <div className="flex items-center gap-1.5 bg-primary/5 rounded-lg px-2.5 py-1.5">
              <CalendarDays className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-primary font-medium">Ближайшее событие на этой неделе</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-muted-foreground" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="h-8 text-[11px] rounded-xl px-4 font-semibold gap-1.5">
              Вступить
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
});
