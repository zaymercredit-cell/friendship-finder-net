import { useMemo } from "react";
import { Link } from "react-router-dom";
import { mockUsers, mockMessages, mockMatches, mockEvents, mockCommunities, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MessageCircle, Users, MapPin, Sparkles, Calendar,
  Gift, Eye, TrendingUp, Zap, Coffee, Bell, ArrowRight, Star,
  Radio
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StreakWidget from "@/components/StreakWidget";

export default function HomePage() {
  const { profile } = useAuth();
  const displayName = profile ? profile.first_name : currentUser.name.split(" ")[0];

  const newMatches = mockMatches.filter(m => m.matchedAt === "Сегодня" || m.matchedAt === "Вчера").slice(0, 5);
  const unreadMessages = mockMessages.filter(m => m.unread > 0).slice(0, 4);
  const onlineNow = mockUsers.filter(u => u.isOnline).slice(0, 10);
  const upcomingEvents = mockEvents.filter(e => !e.isGoing).slice(0, 3);

  const aiRecommendations = useMemo(() =>
    mockUsers.slice(0, 30)
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6),
    []
  );

  const profileViewsToday = 12;
  const likesToday = 8;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* ═══ GREETING ═══ */}
      <div className="premium-card p-5">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">Привет, {displayName}! 👋</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Вот что нового для вас сегодня</p>
        
        {/* Quick stats */}
        <div className="flex items-center gap-4 mt-4">
          <Link to="/likes-you" className="flex items-center gap-2 bg-primary/5 rounded-xl px-3 py-2 hover:bg-primary/10 transition-colors">
            <Heart className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[14px] font-bold text-foreground">{likesToday}</p>
              <p className="text-[10px] text-muted-foreground">Симпатий</p>
            </div>
          </Link>
          <Link to="/profile-views" className="flex items-center gap-2 bg-accent/5 rounded-xl px-3 py-2 hover:bg-accent/10 transition-colors">
            <Eye className="h-4 w-4 text-accent" />
            <div>
              <p className="text-[14px] font-bold text-foreground">{profileViewsToday}</p>
              <p className="text-[10px] text-muted-foreground">Просмотров</p>
            </div>
          </Link>
          <Link to="/matches" className="flex items-center gap-2 bg-success/5 rounded-xl px-3 py-2 hover:bg-success/10 transition-colors">
            <Sparkles className="h-4 w-4 text-success" />
            <div>
              <p className="text-[14px] font-bold text-foreground">{newMatches.length}</p>
              <p className="text-[10px] text-muted-foreground">Совпадений</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══ STREAK ═══ */}
      <StreakWidget />

      {/* ═══ NEW MATCHES ═══ */}
      {newMatches.length > 0 && (
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-[14px] font-semibold text-foreground">Новые совпадения</span>
              <Badge variant="secondary" className="text-[10px]">{newMatches.length}</Badge>
            </div>
            <Link to="/matches"><Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {newMatches.map(m => (
              <Link key={m.id} to={`/profile/${m.user.username}`} className="shrink-0 text-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={m.user.avatar} alt={m.user.name} className="object-cover" />
                    <AvatarFallback>{m.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.matchScore}%</div>
                  {m.user.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
                  )}
                </div>
                <p className="text-[11px] font-medium text-foreground mt-1.5 truncate w-16">{m.user.name.split(" ")[0]}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ UNREAD MESSAGES ═══ */}
      {unreadMessages.length > 0 && (
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-[14px] font-semibold text-foreground">Новые сообщения</span>
              <Badge variant="destructive" className="text-[10px]">{unreadMessages.reduce((s, m) => s + m.unread, 0)}</Badge>
            </div>
            <Link to="/messages"><Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button></Link>
          </div>
          <div className="space-y-2">
            {unreadMessages.map(m => (
              <Link key={m.id} to="/messages" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition-colors">
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.from.avatar} alt={m.from.name} className="object-cover" />
                    <AvatarFallback className="text-[11px]">{m.from.name[0]}</AvatarFallback>
                  </Avatar>
                  {m.isOnline && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{m.from.name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{m.lastMessage}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{m.time}</p>
                  <Badge variant="destructive" className="text-[9px] mt-0.5 h-4 px-1.5">{m.unread}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ AI RECOMMENDATIONS ═══ */}
      <div className="premium-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[14px] font-semibold text-foreground">AI рекомендует сегодня</span>
          </div>
          <Link to="/discover"><Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {aiRecommendations.map(({ user: u, score }) => (
            <Link key={u.id} to={`/profile/${u.username}`} className="shrink-0 text-center group">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-primary/15 group-hover:ring-primary/30 transition-all">
                  <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                {u.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />}
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded-md">{score}%</div>
              </div>
              <p className="text-[11px] font-medium text-foreground mt-1.5 truncate w-16">{u.name.split(" ")[0]}</p>
              <p className="text-[10px] text-muted-foreground">{u.age}, {u.city?.split(" ")[0]}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ ONLINE NOW ═══ */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-[14px] font-semibold text-foreground">Сейчас онлайн</span>
          <Badge variant="secondary" className="text-[10px]">{onlineNow.length}</Badge>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {onlineNow.map(u => (
            <Link key={u.id} to={`/profile/${u.username}`} className="shrink-0">
              <Avatar className="h-11 w-11 ring-2 ring-success/20 hover:ring-success/50 transition-all">
                <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                <AvatarFallback className="text-[11px]">{u.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ UPCOMING EVENTS ═══ */}
      {upcomingEvents.length > 0 && (
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-[14px] font-semibold text-foreground">События рядом</span>
            </div>
            <Link to="/events"><Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button></Link>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map(e => (
              <Link key={e.id} to="/events" className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />{e.city} • {e.time}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{e.attendees}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ COMMUNITIES ═══ */}
      <div className="premium-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[14px] font-semibold text-foreground">Сообщества</span>
          </div>
          <Link to="/communities"><Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button></Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {mockCommunities.slice(0, 4).map(c => (
            <Link key={c.id} to={`/communities/${c.id}`} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
              <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0">
                <img src={c.cover} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.membersCount.toLocaleString()} уч.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ INVITE CTA ═══ */}
      <Link to="/invite" className="block">
        <div className="premium-card p-4 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-foreground">Пригласите друзей</p>
              <p className="text-[12px] text-muted-foreground">Получите 7 дней VIP за каждого друга</p>
            </div>
            <Button size="sm" className="shrink-0 rounded-xl h-8 text-[12px]">Пригласить</Button>
          </div>
        </div>
      </Link>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Heart, label: "Знакомства", to: "/discover", color: "text-primary" },
          { icon: MessageCircle, label: "Чаты", to: "/messages", color: "text-primary" },
          { icon: Users, label: "Друзья", to: "/friends", color: "text-primary" },
          { icon: Star, label: "Premium", to: "/premium", color: "text-amber-500" },
        ].map(item => (
          <Link key={item.to} to={item.to} className="premium-card p-3 text-center hover:bg-secondary/40 transition-colors">
            <item.icon className={`h-5 w-5 mx-auto ${item.color}`} />
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
