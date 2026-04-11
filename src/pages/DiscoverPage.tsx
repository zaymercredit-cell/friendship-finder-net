import { useState, useMemo } from "react";
import { mockUsers, currentUser, calculateMatchScore, allInterests, communicationGoalOptions, cities, lookingForGenderOptions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart, MessageCircle, MapPin,
  SlidersHorizontal, Sparkles, Target, Users, Brain, Navigation, Star,
  TrendingUp, Flame, Eye, Coffee, Smile, Sun, Radio
} from "lucide-react";
import MoodBadge from "@/components/MoodBadge";
import CommunityMatchingSection from "@/components/discover/CommunityMatchingSection";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useStartConversation } from "@/hooks/useConversations";
import { useDailyLikes } from "@/hooks/useDailyLikes";
import { useSuperLike } from "@/hooks/useSuperLike";
import VipPromoBanner from "@/components/VipPromoBanner";
import AdPlaceholder from "@/components/AdPlaceholder";
import VipPaywallModal from "@/components/VipPaywallModal";

interface DiscoverCardProps {
  user: typeof mockUsers[0];
  score: number;
  onLike: (e: React.MouseEvent) => void;
  onPass: (e: React.MouseEvent) => void;
  onMessage: (e: React.MouseEvent) => void;
  onSuperLike?: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function DiscoverCard({ user, score, onLike, onPass, onMessage, onSuperLike, onClick }: DiscoverCardProps) {
  const scoreColor = score >= 80 ? "bg-success" : score >= 60 ? "bg-primary" : "bg-muted-foreground";

  return (
    <div onClick={onClick} className="premium-card overflow-hidden cursor-pointer">
      <div className="relative aspect-[3/4] max-h-80 overflow-hidden">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {user.isOnline && (
            <div className="flex items-center gap-1.5 bg-card/80 rounded-lg text-[11px] font-medium px-2.5 py-1 text-foreground">
              <span className="h-2 w-2 rounded-full bg-success" />
              онлайн
            </div>
          )}
          <div className={`${scoreColor} text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-lg ml-auto`}>
            {score}%
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-4">
          <h3 className="text-[17px] font-bold text-white leading-tight">
            {user.name.split(" ")[0]}, {user.age}
          </h3>
          <p className="text-[12px] text-white/80 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {user.city}
          </p>
        </div>
      </div>

      <div className="p-3.5 space-y-2.5">
        {user.about && (
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-snug">{user.about}</p>
        )}
        
        <div className="flex flex-wrap gap-1">
          {user.interests.slice(0, 3).map(tag => {
            const isCommon = currentUser.interests.includes(tag);
            return (
              <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isCommon ? "text-primary bg-primary/8" : "text-muted-foreground bg-secondary"}`}>{tag}</span>
            );
          })}
          {user.interests.length > 3 && (
            <span className="text-[10px] text-muted-foreground/50">+{user.interests.length - 3}</span>
          )}
        </div>
        
        {user.communicationGoals && user.communicationGoals.length > 0 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Target className="h-2.5 w-2.5 text-primary/50" />
            {user.communicationGoals[0]}
          </span>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <Button size="sm" className="flex-1 gap-1 text-[12px] h-9 rounded-xl font-semibold" onClick={onLike}>
            <Heart className="h-3.5 w-3.5" />
            Нравится
          </Button>
          {onSuperLike && (
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl text-warning border-warning/30 hover:bg-warning/10" onClick={onSuperLike} title="Super Like">
              <Star className="h-4 w-4" />
            </Button>
          )}
          <Button variant="secondary" size="sm" className="h-9 w-9 p-0 rounded-xl" onClick={onMessage}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge, action }: { icon: any; title: string; badge?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
        {badge && <Badge variant="secondary" className="text-[10px] font-semibold">{badge}</Badge>}
      </div>
      {action}
    </div>
  );
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startConversation = useStartConversation();
  const { canLike, remaining, isVip } = useDailyLikes();
  const { canSuperLike, sendSuperLike } = useSuperLike();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("any");
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterWithPhoto, setFilterWithPhoto] = useState(false);
  const [filterReadyMeet, setFilterReadyMeet] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const scoredUsers = useMemo(() => {
    return mockUsers
      .filter(u => u.id !== currentUser.id && u.showInDiscover !== false)
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u) }))
      .sort((a, b) => b.score - a.score);
  }, []);

  const filteredUsers = useMemo(() => {
    return scoredUsers.filter(({ user }) => {
      if (passedIds.has(user.id) || likedIds.has(user.id)) return false;
      if (filterCity !== "all" && user.city !== filterCity) return false;
      if (filterGender !== "any" && user.gender !== filterGender) return false;
      if (user.age && (user.age < ageRange[0] || user.age > ageRange[1])) return false;
      if (filterOnline && !user.isOnline) return false;
      if (filterReadyMeet && !user.readyForMeetings) return false;
      if (selectedGoals.length > 0 && !(user.communicationGoals || []).some(g => selectedGoals.includes(g))) return false;
      if (selectedInterests.length > 0 && !user.interests.some(i => selectedInterests.includes(i))) return false;
      return true;
    });
  }, [scoredUsers, filterCity, filterGender, ageRange, filterOnline, filterWithPhoto, filterReadyMeet, selectedGoals, selectedInterests, passedIds, likedIds]);

  const highCompatibility = filteredUsers.filter(({ score }) => score >= 80);
  const onlineUsers = filteredUsers.filter(({ user }) => user.isOnline);
  const newUsers = filteredUsers.filter(({ user }) => parseInt(user.id) > 100);
  const recommendations = filteredUsers.slice(0, 6);
  const restUsers = filteredUsers.slice(6);

  const handleLike = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!canLike) {
      toast.error("Лимит симпатий исчерпан", { description: "Активируйте VIP для безлимитных симпатий" });
      return;
    }
    setLikedIds(prev => new Set(prev).add(userId));
    if (user) {
      try { await supabase.from("likes").insert({ from_user_id: user.id, to_user_id: userId }); } catch {}
    }
    if (Math.random() < 0.2) {
      toast.success("🎉 Взаимная симпатия!", {
        description: "Вы понравились друг другу! Можете начать общение.",
        action: { label: "Перейти", onClick: () => navigate("/matches") },
      });
    } else {
      toast("❤️ Симпатия отправлена");
    }
  };

  const handlePass = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setPassedIds(prev => new Set(prev).add(userId));
    if (user) {
      try { await supabase.from("passes").insert({ from_user_id: user.id, to_user_id: userId }); } catch {}
    }
  };

  const handleMessage = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!user) { toast("Войдите, чтобы написать сообщение"); return; }
    try {
      const convId = await startConversation.mutateAsync(userId);
      navigate(`/messages/${convId}`);
    } catch { toast.error("Не удалось начать диалог"); }
  };

  const handleSuperLike = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!canSuperLike) { setShowPaywall(true); return; }
    try {
      await sendSuperLike.mutateAsync(userId);
      setLikedIds(prev => new Set(prev).add(userId));
      toast.success("⭐ Super Like отправлен!");
    } catch { toast.error("Не удалось отправить Super Like"); }
  };

  const toggleGoal = (g: string) => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleInterest = (i: string) => setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ═══ HERO HEADER ═══ */}
      <div className="premium-card p-6 bg-gradient-to-r from-primary/[0.03] to-accent/[0.03]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[1.5rem] md:text-[1.75rem] font-bold text-foreground tracking-tight">Знакомства</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              {filteredUsers.length} анкет • {onlineUsers.length} онлайн
              {!isVip && <span className="ml-2 text-primary">• {remaining} симпатий осталось</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/swipe">
              <Button size="sm" className="gap-1.5 rounded-xl h-9 text-[13px] font-semibold shadow-sm">
                <Heart className="h-3.5 w-3.5" />Свайпы
              </Button>
            </Link>
            <Link to="/people-nearby">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9 text-[13px]">
                <Navigation className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Рядом</span>
              </Button>
            </Link>
            <Link to="/matches">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9 text-[13px]">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Совпадения</span>
              </Button>
            </Link>
            <Button
              variant={showFilters ? "default" : "secondary"}
              size="sm"
              className="gap-1.5 rounded-xl h-9 text-[13px]"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Фильтры</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ FILTERS ═══ */}
      {showFilters && (
        <div className="premium-card p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-foreground">Параметры поиска</h3>
            <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground" onClick={() => {
              setFilterCity("all"); setFilterGender("any"); setAgeRange([18, 60]);
              setFilterOnline(false); setFilterWithPhoto(false); setFilterReadyMeet(false);
              setSelectedGoals([]); setSelectedInterests([]);
            }}>Сбросить</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-[12px] text-muted-foreground mb-1.5 block">Город</Label>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="bg-secondary/60 border-0 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любой город</SelectItem>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px] text-muted-foreground mb-1.5 block">Кого ищу</Label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="bg-secondary/60 border-0 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lookingForGenderOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px] text-muted-foreground mb-1.5 block">Возраст: {ageRange[0]}–{ageRange[1]}</Label>
              <Slider min={18} max={60} step={1} value={ageRange} onValueChange={setAgeRange} className="mt-3" />
            </div>
          </div>
          <div>
            <Label className="text-[12px] text-muted-foreground mb-1.5 block">Цель общения</Label>
            <div className="flex flex-wrap gap-1.5">
              {communicationGoalOptions.map(g => (
                <Badge key={g} variant={selectedGoals.includes(g) ? "default" : "secondary"} className="cursor-pointer text-[11px] rounded-lg" onClick={() => toggleGoal(g)}>{g}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[12px] text-muted-foreground mb-1.5 block">Интересы</Label>
            <div className="flex flex-wrap gap-1.5">
              {allInterests.map(i => (
                <Badge key={i} variant={selectedInterests.includes(i) ? "default" : "secondary"} className="cursor-pointer text-[11px] rounded-lg" onClick={() => toggleInterest(i)}>{i}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="disc-online" checked={filterOnline} onCheckedChange={setFilterOnline} />
              <Label htmlFor="disc-online" className="text-[12px]">Онлайн</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="disc-meet" checked={filterReadyMeet} onCheckedChange={setFilterReadyMeet} />
              <Label htmlFor="disc-meet" className="text-[12px]">Готовы к встречам</Label>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 🔥 LIVE MODE ═══ */}
      {!showFilters && onlineUsers.length > 0 && (
        <div className="premium-card overflow-hidden">
          <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-destructive/[0.06] to-warning/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Radio className="h-4 w-4 text-destructive" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive pulse-dot" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-foreground flex items-center gap-1.5">
                  Live Mode
                  <span className="text-[10px] font-semibold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-md">LIVE</span>
                </h2>
                <p className="text-[11px] text-muted-foreground">{onlineUsers.length} человек готовы познакомиться прямо сейчас</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {onlineUsers.slice(0, 8).map(({ user: u, score }) => (
                <div
                  key={u.id + "-live"}
                  className="relative rounded-xl overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform"
                  onClick={() => navigate(`/profile/${u.username}`)}
                >
                  <div className="aspect-[3/4] max-h-48">
                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-destructive/90 text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {score}%
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-2.5">
                    <p className="text-[13px] font-bold text-white drop-shadow-md">{u.name.split(" ")[0]}, {u.age}</p>
                    <p className="text-[10px] text-white/70 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{u.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRENDING TODAY — Growth Engine ═══ */}
      {!showFilters && filteredUsers.length > 2 && (
        <div>
          <SectionHeader icon={TrendingUp} title="В тренде сегодня" badge="🔥 Hot" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.slice(0, 3).map(({ user, score }) => (
              <DiscoverCard
                key={user.id + "-trend"} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
                onSuperLike={(e) => handleSuperLike(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ ONLINE NOW ═══ */}
      {onlineUsers.length > 0 && !showFilters && (
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-success pulse-dot" />
            <span className="text-[14px] font-semibold text-foreground">Сейчас онлайн</span>
            <span className="text-[11px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md">{onlineUsers.length}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {onlineUsers.slice(0, 10).map(({ user: u, score }) => (
              <Link key={u.id} to={`/profile/${u.username}`} className="shrink-0 text-center group">
                <div className="relative">
                  <div className="p-[2px] rounded-full bg-gradient-to-br from-success/60 to-success/30 group-hover:from-success group-hover:to-success/60 transition-all">
                    <Avatar className="h-14 w-14 ring-2 ring-card">
                      <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none shadow-sm">{score}%</div>
                </div>
                <p className="text-[11px] text-foreground mt-1.5 font-medium truncate w-14">{u.name.split(" ")[0]}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ HIGH COMPATIBILITY ═══ */}
      {highCompatibility.length > 0 && !showFilters && (
        <div>
          <SectionHeader icon={Brain} title="Высокая совместимость" badge="AI" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highCompatibility.slice(0, 3).map(({ user, score }) => (
              <DiscoverCard
                key={user.id} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
                onSuperLike={(e) => handleSuperLike(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ HIGH CHEMISTRY ═══ */}
      {!showFilters && filteredUsers.length > 3 && (
        <div>
          <SectionHeader icon={Flame} title="Высокая химия" badge="AI Chemistry" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.slice(2, 5).map(({ user, score }) => (
              <DiscoverCard
                key={user.id + "-chem"} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ SAME MOOD TODAY ═══ */}
      {!showFilters && filteredUsers.length > 7 && (
        <div>
          <SectionHeader icon={Smile} title="Сегодня хотят общаться" badge="Mood" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredUsers.slice(6, 10).map(({ user, score }) => (
              <div
                key={user.id + "-mood"}
                className="premium-card p-3 cursor-pointer group"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    <AvatarImage src={user.avatar} className="object-cover" />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{user.name.split(" ")[0]}, {user.age}</p>
                    <p className="text-[10px] text-muted-foreground">{user.city}</p>
                  </div>
                </div>
                <MoodBadge mood={["chatty", "walk", "open", "coffee"][Math.floor(Math.random() * 4)]} compact />
                <div className="flex items-center gap-1 mt-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-medium text-primary">{score}% совместимость</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SIMILAR INTERESTS ═══ */}
      {!showFilters && filteredUsers.length > 10 && (
        <div>
          <SectionHeader icon={Sun} title="Похожие интересы" badge="Match" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.slice(8, 11).map(({ user, score }) => (
              <DiscoverCard
                key={user.id + "-interest"}
                user={user}
                score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ EASY TO TALK TO ═══ */}
      {!showFilters && filteredUsers.length > 5 && (
        <div>
          <SectionHeader icon={Coffee} title="Легко общаться" badge="Conversation AI" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.slice(4, 7).map(({ user, score }) => (
              <DiscoverCard
                key={user.id + "-conv"} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ RECOMMENDATIONS ═══ */}
      {recommendations.length > 0 && (
        <div>
          <SectionHeader icon={Sparkles} title="Рекомендуем для вас"
            badge={`${filteredUsers.length} анкет`}
            action={<Link to="/swipe"><Button variant="ghost" size="sm" className="text-[12px] text-primary gap-1"><Heart className="h-3.5 w-3.5" />Свайпы →</Button></Link>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(({ user, score }) => (
              <DiscoverCard
                key={user.id} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
                onSuperLike={(e) => handleSuperLike(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ NEW USERS ═══ */}
      {newUsers.length > 0 && (
        <div>
          <SectionHeader icon={Zap} title="Новые пользователи" badge="New" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newUsers.slice(0, 3).map(({ user, score }) => (
              <DiscoverCard
                key={user.id} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ HIGH TRUST ═══ */}
      {!showFilters && filteredUsers.length > 12 && (
        <div>
          <SectionHeader icon={Eye} title="Высокий уровень доверия" badge="Trust" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.slice(11, 14).map(({ user, score }) => (
              <DiscoverCard
                key={user.id + "-trust"} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ LIKELY TO REPLY ═══ */}
      {!showFilters && filteredUsers.length > 15 && (
        <div>
          <SectionHeader icon={MessageCircle} title="Скорее всего ответят" badge="AI" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.slice(14, 17).map(({ user, score }) => (
              <DiscoverCard
                key={user.id + "-reply"} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ REST ═══ */}
      {restUsers.length > 0 && (
        <div>
          <SectionHeader icon={Users} title="Ещё анкеты" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restUsers.map(({ user, score }) => (
              <DiscoverCard
                key={user.id} user={user} score={score}
                onClick={() => navigate(`/profile/${user.username}`)}
                onLike={(e) => handleLike(e, user.id)}
                onPass={(e) => handlePass(e, user.id)}
                onMessage={(e) => handleMessage(e, user.id)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-20 premium-card">
          <Heart className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-[18px] font-semibold text-foreground mb-2">Анкеты не найдены</h3>
          <p className="text-[14px] text-muted-foreground mb-6">Попробуйте изменить фильтры или расширить поиск</p>
          <Button variant="outline" className="rounded-xl" onClick={() => {
            setFilterCity("all"); setFilterGender("any"); setAgeRange([18, 60]);
            setFilterOnline(false); setFilterReadyMeet(false);
            setSelectedGoals([]); setSelectedInterests([]);
            setPassedIds(new Set()); setLikedIds(new Set());
          }}>Сбросить все фильтры</Button>
        </div>
      )}

      {/* ═══ COMMUNITY MATCHING ═══ */}
      <CommunityMatchingSection />

      <VipPromoBanner />
      <VipPaywallModal open={showPaywall} onOpenChange={setShowPaywall} feature="superlike" />
    </div>
  );
}
