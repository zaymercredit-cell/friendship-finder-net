import { useMemo } from "react";
import { Link } from "react-router-dom";
import { mockUsers, mockMessages, mockMatches, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MessageCircle, Sparkles, ArrowRight, Compass, Zap, Coffee, Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { profile } = useAuth();
  const displayName = profile ? profile.first_name : currentUser.name.split(" ")[0];

  const aiTop = useMemo(() =>
    mockUsers
      .filter(u => u.id !== currentUser.id)
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    []
  );

  const newMatches = mockMatches.slice(0, 4);
  const unread = mockMessages.filter(m => m.unread > 0).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2">
      {/* ═══ AI HERO — главный фокус ═══ */}
      <div className="text-center space-y-2 pt-4">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/8 px-3 py-1 rounded-full">
          <Sparkles className="h-3 w-3" />
          AI подбор
        </div>
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">Привет, {displayName}</h1>
        <p className="text-[14px] text-muted-foreground max-w-md mx-auto">
          AI выбрал {aiTop.length} человека, с которыми у тебя самая высокая совместимость сегодня
        </p>
      </div>

      {/* ═══ AI TOP MATCHES — крупно, по центру ═══ */}
      <div className="space-y-3">
        {aiTop.map(({ user: u, score }) => (
          <Link
            key={u.id}
            to={`/profile/${u.username}`}
            className="block bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
          >
            <div className="flex items-stretch">
              <div className="w-28 h-28 shrink-0 relative">
                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" loading="lazy" />
                {u.isOnline && (
                  <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-success ring-2 ring-card" />
                )}
              </div>
              <div className="flex-1 p-3.5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate">{u.name.split(" ")[0]}, {u.age}</p>
                    <p className="text-[12px] text-muted-foreground truncate">{u.city}</p>
                  </div>
                  <div className="bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0">
                    {score}%
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  {score >= 80 && <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-warning" />Высокая химия</span>}
                  {score >= 70 && <span className="flex items-center gap-1"><Coffee className="h-2.5 w-2.5 text-primary" />Легко общаться</span>}
                </div>
                <p className="text-[12px] text-foreground/80 line-clamp-2 mt-1.5 leading-snug">
                  {u.about || "Узнай больше в профиле"}
                </p>
              </div>
            </div>
          </Link>
        ))}
        <Link to="/discover">
          <Button variant="outline" className="w-full h-10 rounded-xl text-[13px] gap-1.5">
            <Compass className="h-4 w-4" />
            Смотреть всех
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* ═══ Compact secondary blocks ═══ */}
      <div className="grid grid-cols-2 gap-3">
        {/* Matches */}
        <Link to="/matches" className="bg-card border border-border/40 rounded-2xl p-3.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Совпадения
            </span>
            <Badge variant="secondary" className="text-[10px] h-5">{newMatches.length}</Badge>
          </div>
          <div className="flex -space-x-2">
            {newMatches.map(m => (
              <Avatar key={m.id} className="h-8 w-8 ring-2 ring-card">
                <AvatarImage src={m.user.avatar} className="object-cover" />
                <AvatarFallback className="text-[10px]">{m.user.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </Link>

        {/* Messages */}
        <Link to="/messages" className="bg-card border border-border/40 rounded-2xl p-3.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              Сообщения
            </span>
            {unread.length > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5">{unread.reduce((s, m) => s + m.unread, 0)}</Badge>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground truncate">
            {unread[0] ? `${unread[0].from.name.split(" ")[0]}: ${unread[0].lastMessage}` : "Нет новых"}
          </p>
        </Link>

        {/* Profile views */}
        <Link to="/profile-views" className="bg-card border border-border/40 rounded-2xl p-3.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" />
              Просмотры
            </span>
            <Badge variant="secondary" className="text-[10px] h-5">12</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Кто смотрел твой профиль</p>
        </Link>

        {/* Likes you */}
        <Link to="/likes-you" className="bg-card border border-border/40 rounded-2xl p-3.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Симпатии
            </span>
            <Badge variant="secondary" className="text-[10px] h-5">8</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Кому ты понравился</p>
        </Link>
      </div>

      {/* AI hint footer */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-muted-foreground/70">
          💡 Нажми на <Sparkles className="h-3 w-3 inline text-primary" /> справа внизу — AI поможет с советом
        </p>
      </div>
    </div>
  );
}
