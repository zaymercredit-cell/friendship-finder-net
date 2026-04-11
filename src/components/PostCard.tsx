import { Heart, MessageCircle, Share2, MoreHorizontal, Globe, Users, Lock, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/mock-data";
import type { RealPost } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { useState, memo } from "react";
import { Link } from "react-router-dom";
import PhotoGalleryLightbox from "@/components/PhotoGalleryLightbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const visibilityIcon = {
  all: Globe,
  friends: Users,
  private: Lock,
};

// Support both mock Post and real RealPost
type PostCardProps = { post: Post } | { realPost: RealPost };

export default memo(function PostCard(props: PostCardProps) {
  const isMock = "post" in props;
  
  // Normalize data
  const authorName = isMock ? props.post.author.name : `${props.realPost.author?.first_name || ""} ${props.realPost.author?.last_name || ""}`.trim();
  const authorAvatar = isMock ? props.post.author.avatar : props.realPost.author?.avatar_url || "";
  const authorUsername = isMock ? props.post.author.username : props.realPost.author?.username || props.realPost.author_id;
  const isOnline = isMock ? props.post.author.isOnline : props.realPost.author?.is_online || false;
  const content = isMock ? props.post.content : props.realPost.content;
  const images = isMock ? (props.post.images || []) : (props.realPost.images || []);
  const createdAt = isMock ? props.post.createdAt : props.realPost.created_at;
  const initialLikes = isMock ? props.post.likes : props.realPost.likes_count;
  const commentsCount = isMock ? props.post.comments : props.realPost.comments_count;
  const sharesCount = isMock ? props.post.shares : props.realPost.shares_count;
  const visibility = isMock ? props.post.visibility : (props.realPost.visibility as "all" | "friends" | "private");
  const initialLiked = isMock ? props.post.isLiked : false;

  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [saved, setSaved] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const VisIcon = visibilityIcon[visibility] || Globe;

  const timeAgo = (() => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч`;
    return `${Math.floor(hours / 24)} д`;
  })();

  return (
    <article className="bg-card rounded-xl card-shadow border border-border/60 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link to={`/profile/${authorUsername}`} className="relative shrink-0">
          <Avatar className="h-10 w-10 ring-1 ring-border/30">
            <AvatarImage src={authorAvatar} alt={authorName} className="object-cover" />
            <AvatarFallback className="text-[13px]">{authorName[0]}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${authorUsername}`} className="text-[14px] font-semibold text-foreground hover:underline decoration-1 underline-offset-2">
            {authorName}
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{timeAgo}</span>
            <span>·</span>
            <VisIcon className="h-3 w-3" />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSaved(!saved); toast.success(saved ? "Убрано из сохранённых" : "Сохранено"); }}>
              <Bookmark className="h-4 w-4 mr-2" />{saved ? "Убрать из сохранённых" : "Сохранить"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <>
          <div className={cn("grid gap-0.5", images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2")}>
            {images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={cn("relative cursor-pointer overflow-hidden", images.length === 1 ? "max-h-[400px]" : "aspect-square", images.length === 3 && idx === 0 && "row-span-2 aspect-auto")}
                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                {idx === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <PhotoGalleryLightbox images={images} currentIndex={lightboxIndex} open={lightboxOpen} onOpenChange={setLightboxOpen} onNavigate={setLightboxIndex} />
        </>
      )}

      {/* Stats */}
      {(likesCount > 0 || commentsCount > 0 || sharesCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-[12px] text-muted-foreground border-t border-border/40">
          <span>{likesCount > 0 ? `${likesCount} отметок «нравится»` : ""}</span>
          <div className="flex gap-3">
            {commentsCount > 0 && <span>{commentsCount} комм.</span>}
            {sharesCount > 0 && <span>{sharesCount} репостов</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center border-t border-border/40">
        <Button variant="ghost" className={cn("flex-1 gap-2 rounded-none h-11 text-[13px]", liked && "text-destructive")} onClick={toggleLike}>
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />Нравится
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 rounded-none h-11 text-[13px] text-muted-foreground">
          <MessageCircle className="h-4 w-4" />Комментарий
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 rounded-none h-11 text-[13px] text-muted-foreground">
          <Share2 className="h-4 w-4" />Поделиться
        </Button>
      </div>
    </article>
  );
});
