import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { mockCommunities, mockPosts, mockUsers, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search, Plus, Users, ArrowLeft, FileText, Calendar, Info,
  UserPlus, LogOut, MessageCircle, Circle, Sparkles, TrendingUp,
  MapPin, Heart, Zap, Coffee, Star
} from "lucide-react";
import PostCard from "@/components/PostCard";
import CommunityCard from "@/components/CommunityCard";
import { toast } from "sonner";

function pseudoScore(id: string, base: number, range: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return base + (Math.abs(hash) % range);
}

function CommunityListView() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCommunities = mockCommunities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const popular = useMemo(() => [...filteredCommunities].sort((a, b) => b.membersCount - a.membersCount), [filteredCommunities]);
  const byInterests = useMemo(() => filteredCommunities.filter(c => c.tags.some(t => currentUser.interests.includes(t))), [filteredCommunities]);

  const displayed = activeTab === "popular" ? popular
    : activeTab === "interests" ? byInterests
    : filteredCommunities;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Сообщества</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{mockCommunities.length} сообществ • единомышленники рядом</p>
        </div>
        <Button size="sm" className="gap-1.5 text-[13px] rounded-xl">
          <Plus className="h-4 w-4" />Создать
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Найти сообщество..."
          className="pl-9 bg-card border-border/60 text-[14px] rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {[
          { key: "all", label: "Все", icon: Users },
          { key: "popular", label: "Популярные", icon: TrendingUp },
          { key: "interests", label: "По интересам", icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium shrink-0 transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Your interests match hint */}
      {byInterests.length > 0 && activeTab === "all" && (
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[13px] font-semibold text-foreground">Подходят вашим интересам</span>
            <Badge variant="secondary" className="text-[10px]">{byInterests.length}</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {byInterests.slice(0, 4).map(c => (
              <Link key={c.id} to={`/communities/${c.id}`} className="shrink-0 w-36">
                <div className="rounded-xl overflow-hidden border border-border/40">
                  <div className="h-20 overflow-hidden">
                    <img src={c.cover} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.membersCount.toLocaleString()} участников</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayed.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-14 bg-card rounded-xl border border-border/60">
          <p className="text-muted-foreground text-[14px]">Сообщества не найдены</p>
        </div>
      )}
    </div>
  );
}

function CommunityDetailView({ communityId }: { communityId: string }) {
  const community = mockCommunities.find(c => c.id === communityId);
  const [isMember, setIsMember] = useState(false);

  const communityPosts = useMemo(() => mockPosts.slice(0, 4), []);
  const communityMembers = useMemo(() => mockUsers.slice(0, 12), []);
  
  const matchedMembers = useMemo(() => 
    communityMembers
      .map(u => ({ user: u, score: calculateMatchScore(currentUser, u) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6),
    [communityMembers]
  );

  const onlineMembers = useMemo(() => communityMembers.filter(u => u.isOnline), [communityMembers]);

  if (!community) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Сообщество не найдено</p>
        <Link to="/communities">
          <Button variant="outline" className="mt-4 gap-1.5">
            <ArrowLeft className="h-4 w-4" />К списку сообществ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Все сообщества
      </Link>

      <div className="bg-card rounded-xl card-shadow border border-border/60 overflow-hidden">
        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${community.cover})` }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold text-foreground tracking-tight">{community.name}</h1>
              <p className="text-[14px] text-muted-foreground mt-1 leading-relaxed">{community.description}</p>
            </div>
            <Button
              size="sm"
              variant={isMember ? "outline" : "default"}
              className="gap-1.5 shrink-0 text-[13px] rounded-xl"
              onClick={() => { setIsMember(!isMember); toast(isMember ? "Вы покинули сообщество" : "Вы вступили в сообщество!"); }}
            >
              {isMember ? <><LogOut className="h-4 w-4" />Покинуть</> : <><UserPlus className="h-4 w-4" />Вступить</>}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {community.tags.map(tag => (
              <span key={tag} className="text-[12px] text-muted-foreground bg-secondary/80 px-2.5 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />{community.membersCount.toLocaleString()} участников
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />{community.postsCount.toLocaleString()} постов
            </div>
            <div className="flex items-center gap-1.5 text-success">
              <span className="h-2 w-2 rounded-full bg-success" />{onlineMembers.length} онлайн
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Community Match Layer ═══ */}
      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Кто вам подходит</h3>
            <p className="text-[11px] text-muted-foreground">AI подобрал участников по совместимости</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {matchedMembers.map(({ user, score }) => (
            <Link key={user.id} to={`/profile/${user.username}`} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors">
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                  <AvatarFallback className="text-[11px]">{user.name[0]}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-foreground truncate">{user.name.split(" ")[0]}, {user.age}</p>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[10px] text-primary font-medium">{score}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-card border border-border/60 card-shadow rounded-xl h-11 p-1">
          <TabsTrigger value="posts" className="flex-1 gap-1.5 text-[13px] rounded-lg"><FileText className="h-4 w-4" />Посты</TabsTrigger>
          <TabsTrigger value="members" className="flex-1 gap-1.5 text-[13px] rounded-lg"><Users className="h-4 w-4" />Участники</TabsTrigger>
          <TabsTrigger value="events" className="flex-1 gap-1.5 text-[13px] rounded-lg"><Calendar className="h-4 w-4" />События</TabsTrigger>
          <TabsTrigger value="about" className="flex-1 gap-1.5 text-[13px] rounded-lg"><Info className="h-4 w-4" />О нас</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {communityPosts.map(post => <PostCard key={post.id} post={post} />)}
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
            {onlineMembers.length > 0 && (
              <div className="mb-3">
                <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <span className="h-2 w-2 rounded-full bg-success" />Сейчас онлайн
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {onlineMembers.map(u => (
                    <Link key={u.id + "on"} to={`/profile/${u.username}`} className="shrink-0 text-center">
                      <Avatar className="h-10 w-10 ring-2 ring-success/20">
                        <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                        <AvatarFallback className="text-[10px]">{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-[10px] text-foreground mt-1 truncate w-10">{u.name.split(" ")[0]}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {communityMembers.map(user => (
                <Link key={user.id} to={`/profile/${user.username}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                      <AvatarFallback className="text-[12px]">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {user.isOnline ? <><Circle className="h-1.5 w-1.5 fill-success text-success" />онлайн</> : user.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <div className="bg-card rounded-xl border border-border/60 card-shadow p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-[14px] text-muted-foreground">Событий пока нет</p>
            <Button variant="outline" size="sm" className="mt-4 gap-1.5 text-[13px] rounded-xl"><Plus className="h-4 w-4" />Создать событие</Button>
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <div className="bg-card rounded-xl border border-border/60 card-shadow p-5 space-y-4">
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-1.5">Описание</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{community.description}</p>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-1.5">Тематика</h3>
              <div className="flex flex-wrap gap-1.5">
                {community.tags.map(tag => (
                  <span key={tag} className="text-[12px] text-muted-foreground bg-secondary/80 px-2.5 py-0.5 rounded-md">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CommunitiesPage() {
  const { id } = useParams();
  if (id) return <CommunityDetailView communityId={id} />;
  return <CommunityListView />;
}
