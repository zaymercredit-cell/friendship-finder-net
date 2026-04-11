import { mockMatches, mockUsers, calculateMatchScore, currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MapPin, Circle, User, Sparkles, Calendar, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStartConversation } from "@/hooks/useConversations";
import { toast } from "sonner";

export default function MatchesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startConversation = useStartConversation();

  const newMatches = mockMatches.filter(m => m.matchedAt === "Сегодня" || m.matchedAt === "Вчера");
  const olderMatches = mockMatches.filter(m => m.matchedAt !== "Сегодня" && m.matchedAt !== "Вчера");

  const handleMessage = async (userId: string) => {
    if (!user) { toast("Войдите, чтобы написать"); return; }
    try {
      const convId = await startConversation.mutateAsync(userId);
      navigate(`/messages/${convId}`);
    } catch { toast.error("Не удалось начать диалог"); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Совпадения</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Люди, которым вы понравились взаимно</p>
        </div>
        <Link to="/discover">
          <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
            <Heart className="h-4 w-4 text-primary" />Знакомства
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Heart, label: "Всего", value: mockMatches.length, color: "text-primary" },
          { icon: Sparkles, label: "Новые", value: newMatches.filter(m => m.matchedAt === "Сегодня").length, color: "text-warning" },
          { icon: MessageCircle, label: "Общение", value: mockMatches.filter(m => m.hasNewMessage).length, color: "text-success" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border/60 card-shadow p-3.5 text-center">
            <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-[20px] font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {mockMatches.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60 card-shadow">
          <Heart className="h-14 w-14 text-muted-foreground/15 mx-auto mb-4" />
          <h3 className="text-[17px] font-semibold text-foreground mb-1">Совпадений пока нет</h3>
          <p className="text-[14px] text-muted-foreground mb-1">Начните знакомиться — поставьте симпатии людям</p>
          <p className="text-[12px] text-muted-foreground mb-5">Когда симпатия станет взаимной, она появится здесь</p>
          <Link to="/discover">
            <Button className="gap-1.5"><Heart className="h-4 w-4" />Перейти к знакомствам</Button>
          </Link>
        </div>
      ) : (
        <>
          {newMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-warning" />
                <h2 className="text-[14px] font-semibold text-foreground">Новые совпадения</h2>
              </div>
              <div className="space-y-3">
                {newMatches.map(match => (
                  <MatchCard key={match.id} match={match} onMessage={() => handleMessage(match.user.id)} />
                ))}
              </div>
            </div>
          )}

          {olderMatches.length > 0 && (
            <div>
              <h2 className="text-[14px] font-semibold text-foreground mb-3">Ранее</h2>
              <div className="space-y-3">
                {olderMatches.map(match => (
                  <MatchCard key={match.id} match={match} onMessage={() => handleMessage(match.user.id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MatchCard({ match, onMessage }: { match: typeof mockMatches[0]; onMessage: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className="relative shrink-0">
        <Avatar className="h-16 w-16 ring-1 ring-border/30">
          <AvatarImage src={match.user.avatar} alt={match.user.name} className="object-cover" />
          <AvatarFallback className="text-[18px]">{match.user.name[0]}</AvatarFallback>
        </Avatar>
        {match.user.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-foreground truncate">{match.user.name}</h3>
          {match.user.age && <span className="text-[13px] text-muted-foreground">{match.user.age}</span>}
          {match.hasNewMessage && (
            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-medium">новое</span>
          )}
        </div>
        <p className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3" />{match.user.city}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[12px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md">
            {match.matchScore}% совпадение
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />{match.matchedAt}
          </span>
        </div>
        {match.user.interests && (
          <div className="flex flex-wrap gap-1 mt-2">
            {match.user.interests.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <Button size="sm" className="gap-1.5 text-[12px] h-8" onClick={onMessage}>
          <MessageCircle className="h-3.5 w-3.5" />Написать
        </Button>
        <Link to={`/profile/${match.user.username}`}>
          <Button variant="ghost" size="sm" className="w-full gap-1.5 text-[12px] text-muted-foreground h-8">
            <User className="h-3.5 w-3.5" />Профиль
          </Button>
        </Link>
      </div>
    </div>
  );
}
