import { mockUsers, mockCommunities, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Flame, Zap, MessageCircle, Sparkles, Users, TrendingUp,
  Heart, CalendarDays, UserPlus, Star, ArrowRight, Radio,
  Activity, Eye, Target, Coffee
} from "lucide-react";
import SeoHead from "@/components/SeoHead";

/* ── Energy Level Indicator ── */
function EnergyBar({ level, label }: { level: number; label: string }) {
  const color = level >= 80 ? "bg-destructive" : level >= 50 ? "bg-warning" : "bg-primary";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{level}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${level}%` }} />
      </div>
    </div>
  );
}

/* ── Energy Badge ── */
function EnergyBadge({ type }: { type: "hot" | "active" | "live" | "new" }) {
  const config = {
    hot: { icon: Flame, label: "Горячее", className: "bg-destructive/10 text-destructive border-destructive/20" },
    active: { icon: Zap, label: "Активно", className: "bg-warning/10 text-warning border-warning/20" },
    live: { icon: MessageCircle, label: "Живое обсуждение", className: "bg-success/10 text-success border-success/20" },
    new: { icon: Sparkles, label: "Новое", className: "bg-primary/10 text-primary border-primary/20" },
  }[type];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.className}`}>
      <Icon className="h-2.5 w-2.5" />{config.label}
    </span>
  );
}

/* ── Hot Person Card ── */
function HotPersonCard({ user, energy }: { user: typeof mockUsers[0]; energy: number }) {
  const score = calculateMatchScore(currentUser, user);
  return (
    <Link to={`/profile/${user.username}`} className="premium-card p-3 flex items-center gap-3 group hover:shadow-elevated transition-shadow">
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 ring-2 ring-destructive/30">
          <AvatarImage src={user.avatar} className="object-cover" />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-foreground truncate">{user.name.split(" ")[0]}</span>
          {user.age && <span className="text-[11px] text-muted-foreground">{user.age}</span>}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{user.city} · {score}% совместимость</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1 text-[10px] font-bold text-destructive">
          <Activity className="h-3 w-3" />
          {energy}%
        </div>
        <span className="text-[9px] text-muted-foreground">активность</span>
      </div>
    </Link>
  );
}

/* ── Activity Stream Item ── */
function StreamItem({ icon: Icon, color, text, time }: { icon: React.ElementType; color: string; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-secondary/40 transition-colors">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color} shrink-0`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-[12px] text-foreground flex-1">{text}</p>
      <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}

export default function EnergyPage() {
  const [tab, setTab] = useState<"all" | "people" | "events" | "communities">("all");

  const energyData = useMemo(() => ({
    overall: Math.floor(Math.random() * 20 + 75),
    messages: Math.floor(Math.random() * 30 + 60),
    matches: Math.floor(Math.random() * 25 + 55),
    events: Math.floor(Math.random() * 20 + 65),
    communities: Math.floor(Math.random() * 15 + 70),
  }), []);

  const hotPeople = useMemo(() =>
    mockUsers.filter(u => u.isOnline).slice(0, 8).map(u => ({
      user: u,
      energy: Math.floor(Math.random() * 30 + 70),
    })).sort((a, b) => b.energy - a.energy),
  []);

  const stream = useMemo(() => [
    { icon: Heart, color: "bg-primary/10 text-primary", text: "Алина и Дмитрий — новое совпадение!", time: "2 мин" },
    { icon: UserPlus, color: "bg-success/10 text-success", text: "5 новых участников присоединились", time: "5 мин" },
    { icon: CalendarDays, color: "bg-warning/10 text-warning", text: "«Кофе-встреча в центре» набирает участников", time: "8 мин" },
    { icon: MessageCircle, color: "bg-accent/10 text-accent-foreground", text: "42 активных диалога прямо сейчас", time: "10 мин" },
    { icon: Users, color: "bg-primary/10 text-primary", text: "Сообщество «Путешествия» — новое обсуждение", time: "12 мин" },
    { icon: Star, color: "bg-warning/10 text-warning", text: "Марина обновила профиль — доверие 95%", time: "15 мин" },
    { icon: Sparkles, color: "bg-primary/10 text-primary", text: "AI нашёл 12 новых совместимых пар", time: "18 мин" },
    { icon: Flame, color: "bg-destructive/10 text-destructive", text: "Событие «Вечер настольных игр» — 🔥 горячее", time: "20 мин" },
  ], []);

  const hotCommunities = useMemo(() =>
    mockCommunities.slice(0, 4).map(c => ({
      ...c,
      energy: Math.floor(Math.random() * 25 + 65),
      newPosts: Math.floor(Math.random() * 15 + 3),
      growth: Math.floor(Math.random() * 20 + 5),
    })),
  []);

  const tabs = [
    { key: "all" as const, label: "Всё" },
    { key: "people" as const, label: "Люди" },
    { key: "events" as const, label: "События" },
    { key: "communities" as const, label: "Сообщества" },
  ];

  return (
    <>
      <SeoHead title="Социальная энергия — ВДрузьях" description="Узнайте где сейчас происходит жизнь платформы" />
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-[12px] font-semibold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            LIVE · Социальная энергия
          </div>
          <h1 className="text-2xl font-bold text-foreground">Где сейчас жизнь</h1>
          <p className="text-[13px] text-muted-foreground">AI анализирует активность платформы в реальном времени</p>
        </div>

        {/* Overall Energy */}
        <div className="premium-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-destructive" />
              Общая энергия платформы
            </h2>
            <div className="text-2xl font-black text-destructive">{energyData.overall}%</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EnergyBar level={energyData.messages} label="💬 Сообщения" />
            <EnergyBar level={energyData.matches} label="💖 Совпадения" />
            <EnergyBar level={energyData.events} label="📅 События" />
            <EnergyBar level={energyData.communities} label="👥 Сообщества" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-[12px] font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column — Stream + Hot People */}
          <div className="lg:col-span-2 space-y-5">
            {/* Energy Stream */}
            {(tab === "all" || tab === "events") && (
              <div className="premium-card p-4 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-destructive pulse-dot" />
                  <h2 className="text-[14px] font-bold text-foreground">Что происходит прямо сейчас</h2>
                  <EnergyBadge type="live" />
                </div>
                {stream.map((s, i) => (
                  <StreamItem key={i} {...s} />
                ))}
              </div>
            )}

            {/* Hot People */}
            {(tab === "all" || tab === "people") && (
              <div className="premium-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                    <Flame className="h-4 w-4 text-destructive" />
                    Сейчас активно общаются
                  </h2>
                  <EnergyBadge type="hot" />
                </div>
                <div className="space-y-2">
                  {hotPeople.map(hp => (
                    <HotPersonCard key={hp.user.id} {...hp} />
                  ))}
                </div>
                <Link to="/discover" className="flex items-center justify-center gap-1.5 text-[12px] text-primary font-semibold hover:underline pt-1">
                  Смотреть всех <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column — Communities + AI Insights */}
          <div className="space-y-5">
            {/* Hot Communities */}
            {(tab === "all" || tab === "communities") && (
              <div className="premium-card p-4 space-y-3">
                <h2 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  Самые активные сообщества
                </h2>
                {hotCommunities.map(c => (
                  <Link key={c.id} to={`/communities/${c.id}`} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-secondary/40 transition-colors group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">+{c.growth} за неделю · {c.newPosts} новых постов</p>
                    </div>
                    <div className="text-[11px] font-bold text-warning">{c.energy}%</div>
                  </Link>
                ))}
              </div>
            )}

            {/* AI Insights */}
            <div className="premium-card p-4 space-y-3">
              <h2 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI показывает где сейчас жизнь
              </h2>
              <div className="space-y-2.5">
                {[
                  { icon: Coffee, text: "Идеальное время для кофе-встречи — 8 человек рядом ищут компанию", color: "text-warning" },
                  { icon: Heart, text: "Сегодня на 40% больше совпадений — удачный день для знакомств", color: "text-primary" },
                  { icon: Target, text: "Сообщество «Музыка» растёт быстрее всего — +12% за сутки", color: "text-success" },
                ].map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/40">
                    <insight.icon className={`h-4 w-4 ${insight.color} mt-0.5 shrink-0`} />
                    <p className="text-[11.5px] text-foreground leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="premium-card p-4 space-y-2">
              <h2 className="text-[14px] font-bold text-foreground">Быстрые действия</h2>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild size="sm" className="h-9 text-[11px] rounded-xl">
                  <Link to="/discover">
                    <Eye className="h-3.5 w-3.5 mr-1.5" />Знакомства
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary" className="h-9 text-[11px] rounded-xl">
                  <Link to="/events">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />События
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary" className="h-9 text-[11px] rounded-xl">
                  <Link to="/communities">
                    <Users className="h-3.5 w-3.5 mr-1.5" />Сообщества
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary" className="h-9 text-[11px] rounded-xl">
                  <Link to="/messages">
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />Чаты
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
