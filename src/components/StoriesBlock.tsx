import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/lib/mock-data";
import { Link } from "react-router-dom";

interface Story {
  id: string;
  username: string;
  avatar: string;
  name: string;
  hasNew: boolean;
  isOwn?: boolean;
}

export default function StoriesBlock() {
  const { profile } = useAuth();

  const stories: Story[] = useMemo(() => {
    const own: Story = {
      id: "own",
      username: profile?.username || "me",
      avatar: profile?.avatar_url || "",
      name: "Ваша история",
      hasNew: false,
      isOwn: true,
    };
    const others = mockUsers.slice(0, 10).map(u => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      name: u.name.split(" ")[0],
      hasNew: Math.random() > 0.4,
    }));
    return [own, ...others];
  }, [profile]);

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide px-1">
      {stories.map(story => (
        <Link
          key={story.id}
          to={story.isOwn ? "#" : `/profile/${story.username}`}
          className="shrink-0 text-center group"
        >
          <div className="relative">
            <div className={`p-[2.5px] rounded-full ${
              story.isOwn 
                ? "bg-secondary" 
                : story.hasNew 
                  ? "bg-gradient-to-br from-primary via-accent to-primary" 
                  : "bg-border"
            }`}>
              <Avatar className="h-16 w-16 ring-2 ring-card">
                <AvatarImage src={story.avatar} alt={story.name} className="object-cover" />
                <AvatarFallback className="text-[14px]">{story.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            {story.isOwn && (
              <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full gradient-primary flex items-center justify-center border-2 border-card">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 font-medium truncate w-16 group-hover:text-foreground transition-colors">
            {story.isOwn ? "Вы" : story.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
