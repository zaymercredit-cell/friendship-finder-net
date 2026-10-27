import { useState, useMemo, useEffect } from "react";
import { useSessionState, readSessionState, writeSessionState } from "@/lib/session-state";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities, useCommunityDetail, useCommunityMembership } from "@/hooks/useCommunities";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import SmartImage from "@/components/ui/smart-image";
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
  const [search, setSearch] = useSessionState<string>("communities:search", "");
  const [activeTab, setActiveTab] = useSessionState<string>("communities:tab", "all");

  useEffect(() => {
    const y = readSessionState<number>("communities:scroll", 0);
    if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        writeSessionState("communities:scroll", window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      writeSessionState("communities:scroll", window.scrollY);
    };
  }, []);

  const { profile } = useAuth();
  const { data: rows = [], isLoading, isError, refetch } = useCommunities();
  const communities = rows.map(c => ({ id: c.id, name: c.name, description: c.description || "", cover: c.cover_url || "", tags: c.category ? [c.category] : [], membersCount: c.members_count, postsCount: 0 }));
  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const popular = useMemo(() => [...filteredCommunities].sort((a, b) => b.membersCount - a.membersCount), [filteredCommunities]);
  const byInterests = useMemo(() => filteredCommunities.filter(c => c.tags.some(t => (profile?.interests || []).includes(t))), [filteredCommunities]);

  const displayed = activeTab === "popular" ? popular
    : activeTab === "interests" ? byInterests
    : filteredCommunities;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Сообщества</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{communities.length} сообществ • единомышленники рядом</p>
        </div>
        <Button size="sm" disabled className="gap-1.5 text-[13px] rounded-xl">
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
                    <SmartImage src={c.cover} alt={c.name} wrapperClassName="w-full h-full" className="object-cover" />
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

      {isLoading && <PageSkeleton />}
      {isError && <div><p className="text-destructive">Не удалось загрузить сообщества</p><Button variant="outline" onClick={() => refetch()}>Повторить</Button></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayed.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {!isLoading && !isError && displayed.length === 0 && (
        <div className="text-center py-14 bg-card rounded-xl border border-border/60">
          <p className="text-muted-foreground text-[14px]">Сообщества не найдены</p>
        </div>
      )}
    </div>
  );
}

function CommunityDetailView({ communityId }: { communityId: string }) {
  const { data: community, isLoading, isError, refetch } = useCommunityDetail(communityId);
  const membership = useCommunityMembership(communityId);
  if (isLoading) return <PageSkeleton />;
  if (isError) return <div className="text-center py-12"><p>Не удалось загрузить сообщество</p><Button variant="outline" onClick={() => refetch()}>Повторить</Button></div>;
  if (!community) return <div className="text-center py-12"><p>Сообщество не найдено</p><Link to="/communities">Все сообщества</Link></div>;
  return <div className="max-w-2xl mx-auto space-y-4">
    <Link to="/communities" className="inline-flex items-center gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4" />Все сообщества</Link>
    {community.cover_url && <SmartImage src={community.cover_url} alt={community.name} wrapperClassName="h-48 w-full" className="object-cover" />}
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><h1 className="text-page-title">{community.name}</h1><p className="text-muted-foreground mt-2">{community.description}</p></div>
      <Button disabled={membership.isLoading || membership.isError || membership.toggle.isPending} variant={membership.data ? "outline" : "default"} onClick={() => membership.toggle.mutate(!membership.data)}>
        {membership.data ? <><LogOut className="h-4 w-4 mr-2" />Покинуть</> : <><UserPlus className="h-4 w-4 mr-2" />Вступить</>}
      </Button>
    </div>
    {membership.isError && <div><p className="text-destructive">Не удалось проверить участие</p><Button variant="outline" onClick={() => membership.refetch()}>Повторить</Button></div>}
    {community.category && <Badge variant="secondary">{community.category}</Badge>}
  </div>;
}

export default function CommunitiesPage() {
  const { id } = useParams();
  if (id) return <CommunityDetailView communityId={id} />;
  return <CommunityListView />;
}
