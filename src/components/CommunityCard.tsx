import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, ArrowRight, Share2 } from "lucide-react";
import { toast } from "sonner";
import { memo } from "react";

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

export default memo(function CommunityCard({ community }: Props) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/communities/${community.id}`);
    toast.success("Ссылка скопирована!");
  };

  return (
    <Link to={`/communities/${community.id}`} className="block">
      <div className="premium-card overflow-hidden">
        {/* Cover image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={community.cover}
            alt={community.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-[16px] font-bold text-white leading-tight">{community.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{community.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {community.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md font-medium">{tag}</span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {community.membersCount.toLocaleString()} участников
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {community.postsCount} постов
            </span>
          </div>

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
