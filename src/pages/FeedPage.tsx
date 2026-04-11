import { mockPosts, mockUsers, currentUser, calculateMatchScore } from "@/lib/mock-data";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Smile, MapPin, Circle, Heart, Sparkles, Users, TrendingUp, Flame, MessageCircle, Gift, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { useDailyLikes } from "@/hooks/useDailyLikes";
import VipPromoBanner from "@/components/VipPromoBanner";
import AdPlaceholder from "@/components/AdPlaceholder";
import DailyActivitySummary from "@/components/DailyActivitySummary";
import MayKnowBlock from "@/components/MayKnowBlock";
import StaleConversationNudge from "@/components/StaleConversationNudge";
import TrendingProfilesBlock from "@/components/TrendingProfilesBlock";
import NewTodayBlock from "@/components/NewTodayBlock";
import TodayEventsBlock from "@/components/TodayEventsBlock";
import PlatformStatsBlock from "@/components/PlatformStatsBlock";
import StoriesBlock from "@/components/StoriesBlock";
import { usePosts } from "@/hooks/usePosts";
import AiDailySuggestionsCard from "@/components/ai/AiDailySuggestionsCard";
import LiveActivityBlock from "@/components/LiveActivityBlock";
import InstantMatchBlock from "@/components/InstantMatchBlock";
import StreakWidget from "@/components/StreakWidget";
import TodayAwaitsBlock from "@/components/TodayAwaitsBlock";
import ViralShareCard from "@/components/ViralShareCard";
import FomoBlock from "@/components/FomoBlock";
import PersonalMomentsBlock from "@/components/PersonalMomentsBlock";
import ReturnEntryBlock from "@/components/ReturnEntryBlock";
import ReasonsToReturnBlock from "@/components/ReasonsToReturnBlock";
import ActivityFeedBlock from "@/components/ActivityFeedBlock";
import SmartReEngagementBlock from "@/components/SmartReEngagementBlock";
import ProfileEvolutionBlock from "@/components/ProfileEvolutionBlock";

export default function FeedPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile ? `${profile.first_name}` : currentUser.name.split(" ")[0];
  const displayAvatar = profile?.avatar_url || currentUser.avatar;
  const [activeTab, setActiveTab] = useState<"all" | "popular" | "friends">("all");
  const { todayCount, remaining, limit, isVip } = useDailyLikes();
  const { data: realPosts } = usePosts(30);

  const missingFields: { label: string; weight: number }[] = [];
  if (profile) {
    if (!profile.avatar_url) missingFields.push({ label: "Загрузите фото", weight: 30 });
    if (!profile.about) missingFields.push({ label: "Расскажите о себе", weight: 15 });
    if (!profile.interests || profile.interests.length === 0) missingFields.push({ label: "Укажите интересы", weight: 20 });
    if (!profile.communication_goals || profile.communication_goals.length === 0) missingFields.push({ label: "Укажите цель общения", weight: 15 });
    if (!profile.age) missingFields.push({ label: "Укажите возраст", weight: 10 });
    if (!profile.city) missingFields.push({ label: "Укажите город", weight: 10 });
  }
  const profileCompleteness = 100 - missingFields.reduce((sum, f) => sum + f.weight, 0);

  const onlineUsers = mockUsers.filter(u => u.isOnline).slice(0, 8);

  const recommendations = useMemo(() =>
    mockUsers.slice(0, 20)
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6),
    []
  );

  const hasRealPosts = realPosts && realPosts.length > 0;
  const sortedMockPosts = useMemo(() => {
    const posts = [...mockPosts];
    if (activeTab === "popular") return posts.sort((a, b) => b.likes - a.likes);
    return posts;
  }, [activeTab]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Stories */}
      <div className="premium-card p-4">
        <StoriesBlock />
      </div>

      {/* Smart Re-engagement */}
      <SmartReEngagementBlock />

      {/* ═══ TODAY AWAITS — Growth Engine Hero ═══ */}
      <TodayAwaitsBlock />

      {/* AI Daily Suggestions */}
      <AiDailySuggestionsCard />

      {/* Instant Match */}
      <InstantMatchBlock />

      {/* ═══ STREAK WIDGET — Growth Engine ═══ */}
      <StreakWidget />

      {/* FOMO Block */}
      <FomoBlock />

      {/* Reasons to return */}
      <ReasonsToReturnBlock />

      {/* Profile Evolution */}
      <ProfileEvolutionBlock />

      {/* Activity Feed */}
      <ActivityFeedBlock />

      {/* Daily Activity Summary */}
      <DailyActivitySummary />

      {/* Live Activity */}
      <LiveActivityBlock />

      {/* Viral Share Moment */}
      <ViralShareCard />

      {/* Personal Moments */}
      <PersonalMomentsBlock />


      {missingFields.length > 0 && (
        <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[14px] font-semibold text-foreground">Заполните профиль</span>
            </div>
            <Badge variant="secondary" className="text-[11px]">{profileCompleteness}%</Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mb-3">
            <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${profileCompleteness}%` }} />
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">Заполненные анкеты получают в 5 раз больше просмотров</p>
          <div className="flex flex-wrap gap-1.5">
            {missingFields.map(f => (
              <Link key={f.label} to="/settings">
                <span className="text-[12px] text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-md cursor-pointer hover:bg-secondary transition-colors">{f.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* New Today */}
      <NewTodayBlock />

      {/* People you might like */}
      <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-[14px] font-semibold text-foreground">Рекомендуем для вас</span>
          </div>
          <Link to="/discover">
            <Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {recommendations.map(({ user: u, score }) => (
            <Link key={u.id} to={`/profile/${u.username}`} className="shrink-0 text-center group">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-primary/15 group-hover:ring-primary/40 transition-all">
                  <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                {u.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />
                )}
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1 py-0.5 rounded-md leading-none">{score}%</div>
              </div>
              <p className="text-[12px] text-foreground mt-1.5 font-medium truncate w-16">{u.name.split(" ")[0]}</p>
              <p className="text-[10px] text-muted-foreground">{u.age}, {u.city?.split(" ")[0]}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Profiles */}
      <TrendingProfilesBlock />

      {/* Platform Stats — Social Proof Growth */}
      <PlatformStatsBlock />

      {/* May Know */}
      <MayKnowBlock />

      {/* Stale Conversation Nudge */}
      <StaleConversationNudge />

      {/* Today Events */}
      <TodayEventsBlock />

      {/* Invite CTA */}
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

      {/* Create Post */}
      <div className="bg-card rounded-xl card-shadow border border-border/60 p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-1 ring-border/30">
              <AvatarImage src={displayAvatar} alt={displayName} className="object-cover" />
              <AvatarFallback className="text-[13px]">{displayName[0]}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
          </div>
          <div className="flex-1">
            <div className="bg-secondary/70 rounded-lg px-4 py-3 text-[14px] text-muted-foreground cursor-pointer hover:bg-secondary/90 transition-colors">
              Что нового, {displayName}?
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <Button variant="ghost" size="sm" className="text-[12px] gap-1.5 text-muted-foreground hover:text-foreground h-8">
                <Image className="h-4 w-4 text-primary" />Фото
              </Button>
              <Button variant="ghost" size="sm" className="text-[12px] gap-1.5 text-muted-foreground hover:text-foreground h-8">
                <MapPin className="h-4 w-4 text-accent" />Место
              </Button>
              <Button variant="ghost" size="sm" className="text-[12px] gap-1.5 text-muted-foreground hover:text-foreground h-8">
                <Smile className="h-4 w-4 text-warning" />Настроение
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Online now */}
      <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Circle className="h-2.5 w-2.5 fill-success text-success" />
          <span className="text-[14px] font-semibold text-foreground">Сейчас онлайн</span>
          <span className="text-[11px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md">{onlineUsers.length}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {onlineUsers.map(u => (
            <Link key={u.id} to={`/profile/${u.username}`} className="shrink-0">
              <Avatar className="h-10 w-10 ring-2 ring-success/20 hover:ring-success/50 transition-all">
                <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                <AvatarFallback className="text-[11px]">{u.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ))}
        </div>
      </div>

      {/* Feed tabs */}
      <div className="flex items-center gap-1 bg-card rounded-xl border border-border/60 p-1">
        {[
          { key: "all" as const, label: "Все", icon: Sparkles },
          { key: "popular" as const, label: "Популярное", icon: Flame },
          { key: "friends" as const, label: "Друзья", icon: Users },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIP Promo */}
      <VipPromoBanner />

      {/* Posts */}
      {hasRealPosts ? (
        realPosts.map((post, idx) => (
          <div key={post.id}>
            <PostCard realPost={post} />
            {idx === 2 && <AdPlaceholder className="my-4" />}
          </div>
        ))
      ) : (
        sortedMockPosts.map((post, idx) => (
          <div key={post.id}>
            <PostCard post={post} />
            {idx === 2 && <AdPlaceholder className="my-4" />}
          </div>
        ))
      )}

      <div className="text-center py-6">
        <p className="text-[13px] text-muted-foreground">Это все посты на сегодня</p>
        <Link to="/discover">
          <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-[13px]">
            <Heart className="h-3.5 w-3.5" />
            Знакомьтесь с новыми людьми
          </Button>
        </Link>
      </div>

      {/* Return Entry Points */}
      <ReturnEntryBlock />
    </div>
  );
}
