import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mockCommunities, mockPosts, mockUsers } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search, Plus, Users, ArrowLeft, FileText, Calendar, Info,
  UserPlus, LogOut, MessageCircle, Circle
} from "lucide-react";
import PostCard from "@/components/PostCard";
import CommunityCard from "@/components/CommunityCard";

function CommunityListView() {
  const [search, setSearch] = useState("");

  const filteredCommunities = mockCommunities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title text-foreground">Сообщества</h1>
        <Button size="sm" className="gap-1.5 text-[13px]">
          <Plus className="h-4 w-4" />Создать
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Найти сообщество..."
          className="pl-9 bg-card border-border/60 text-[14px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {filteredCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {filteredCommunities.length === 0 && (
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

  const communityPosts = mockPosts.slice(0, 4);
  const communityMembers = mockUsers.slice(0, 12);

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
              className="gap-1.5 shrink-0 text-[13px]"
              onClick={() => setIsMember(!isMember)}
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
          </div>
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
            <Button variant="outline" size="sm" className="mt-4 gap-1.5 text-[13px]"><Plus className="h-4 w-4" />Создать событие</Button>
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
