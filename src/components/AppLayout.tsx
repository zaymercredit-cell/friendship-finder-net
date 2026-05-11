import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import { cn } from "@/lib/utils";
import {
  Search, Bell, MessageCircle, Plus, Menu, X,
  Home, Users, UsersRound, CalendarDays, Compass, Bookmark, Settings, User, Heart, Sparkles,
  LogOut, Shield, ChevronDown, Eye, MapPin, Map, Gift, Trophy, TrendingUp, Crown, Star, Command, Globe
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useTotalUnread } from "@/hooks/useConversations";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AiAssistantWidget from "@/components/ai/AiAssistantWidget";
import { prefetchRoute } from "@/lib/route-prefetch";
import ErrorBoundary from "@/components/ErrorBoundary";

const sidebarItems = [
  { title: "Главная", url: "/home", icon: Sparkles },
  { title: "Лента", url: "/feed", icon: Home },
  { title: "Энергия", url: "/energy", icon: TrendingUp },
  { title: "Знакомства", url: "/discover", icon: Heart },
  { title: "Совпадения", url: "/matches", icon: Sparkles },
  { title: "Vibe Rooms", url: "/vibe-rooms", icon: Command },
  { title: "Карта знакомств", url: "/social-graph", icon: Sparkles },
  { title: "Вселенная", url: "/universe", icon: Globe },
  { title: "Люди рядом", url: "/people-nearby", icon: MapPin },
  { title: "Карта", url: "/map", icon: Map },
  { title: "События", url: "/events", icon: CalendarDays },
  { title: "Встречи", url: "/meetups", icon: CalendarDays },
  { title: "Свидания", url: "/dates", icon: Heart },
  { title: "Друзья", url: "/friends", icon: Users },
  { title: "Сообщества", url: "/communities", icon: UsersRound },
  { title: "Поиск людей", url: "/people", icon: Compass },
  { title: "Просмотры", url: "/profile-views", icon: Eye },
  { title: "Симпатии ко мне", url: "/likes-you", icon: Star },
  { title: "Активность", url: "/activity", icon: TrendingUp },
  { title: "VIP", url: "/premium", icon: Crown },
  { title: "Достижения", url: "/achievements", icon: Trophy },
  { title: "Пригласить", url: "/invite", icon: Gift },
  { title: "Закладки", url: "/bookmarks", icon: Bookmark },
  { title: "Настройки", url: "/settings", icon: Settings },
];

const mobileItems = [
  { title: "Главная", url: "/home", icon: Sparkles },
  { title: "Поиск", url: "/discover", icon: Compass },
  { title: "Чаты", url: "/messages", icon: MessageCircle },
  { title: "Группы", url: "/communities", icon: UsersRound },
  { title: "Профиль", url: "/profile/me", icon: User },
];

/* ── Global Search Component ── */
function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string; username: string; avatar: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, avatar_url")
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(8);
      setResults((data || []).map(p => ({
        name: `${p.first_name} ${p.last_name}`.trim(),
        username: p.username || "",
        avatar: p.avatar_url || "",
      })));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full max-w-md h-9 bg-secondary/70 rounded-lg px-3 text-[13px] text-muted-foreground/70 hover:bg-secondary/90 transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Поиск людей, сообществ…</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-foreground/40" onClick={() => setOpen(false)} />
      <div className="fixed top-[max(4rem,10vh)] left-1/2 -translate-x-1/2 z-[61] w-[90vw] max-w-lg bg-card rounded-xl border border-border/60 shadow-lg overflow-hidden animate-scale-in">
        <div className="flex items-center gap-2 px-4 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск пользователей…"
            className="flex-1 h-12 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-[13px] text-muted-foreground">Поиск…</div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div className="p-4 text-center text-[13px] text-muted-foreground">Ничего не найдено</div>
          )}
          {!loading && results.length === 0 && !query.trim() && (
            <div className="p-4 text-center text-[13px] text-muted-foreground/60">Начните вводить имя или @username</div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/60 transition-colors text-left"
              onClick={() => { navigate(`/profile/${r.username}`); setOpen(false); setQuery(""); }}
            >
              <Avatar className="h-9 w-9 ring-1 ring-border/40">
                <AvatarImage src={r.avatar} />
                <AvatarFallback className="text-[12px] bg-secondary">{r.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-foreground truncate">{r.name}</p>
                <p className="text-[12px] text-muted-foreground truncate">@{r.username}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const totalUnread = useTotalUnread();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card">
        <div className="mx-auto flex h-[56px] max-w-7xl items-center gap-4 px-4">
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-[13px] font-bold text-primary-foreground">В</span>
            </div>
            <span className="text-[17px] font-bold text-foreground hidden sm:block tracking-tight">ВДрузьях</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <GlobalSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="relative hidden sm:flex h-9 w-9 text-muted-foreground hover:text-foreground">
              <Plus className="h-5 w-5" />
            </Button>
            <Link to="/messages">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-5 w-5" />
                {totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center px-1">{totalUnread > 9 ? "9+" : totalUnread}</span>
                )}
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center px-1">2</span>
              </Button>
            </Link>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-secondary/80 transition-colors ml-0.5">
                  <Avatar className="h-8 w-8 ring-1 ring-border/50">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || ''} />
                    <AvatarFallback className="text-[13px] bg-secondary">{profile?.first_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/60 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2.5">
                  <p className="text-[14px] font-semibold text-foreground">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-[12px] text-muted-foreground">@{profile?.username || 'user'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${profile?.username || 'me'}`} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />Мой профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/matches" className="cursor-pointer">
                    <Sparkles className="h-4 w-4 mr-2" />Совпадения
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />Настройки
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />Админ-панель
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] py-3 pr-2">
          <nav className="space-y-0.5 px-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                onMouseEnter={() => prefetchRoute(item.url)}
                onFocus={() => prefetchRoute(item.url)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-150",
                  isActive(item.url)
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 py-4 pb-20 md:pb-4">
          <ErrorBoundary scope={`route:${location.pathname}`} key={location.pathname}>
            <Suspense fallback={<PageSkeleton />}>
              {children ?? <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation — Premium */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-card safe-area-bottom">
        <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto">
          {mobileItems.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                onTouchStart={() => prefetchRoute(item.url)}
                onMouseEnter={() => prefetchRoute(item.url)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-1 min-w-[52px] transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground active:scale-95"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200",
                  active && "bg-primary/10"
                )}>
                  <item.icon className={cn("h-[20px] w-[20px] transition-all", active && "stroke-[2.5px]")} />
                  {item.url === "/messages" && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-4 min-w-[16px] rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-1">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-background p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск..." className="pl-9 bg-secondary border-0 text-[14px]" autoFocus />
          </div>
          <nav className="space-y-0.5">
            {sidebarItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setMobileMenuOpen(false)}
                onTouchStart={() => prefetchRoute(item.url)}
                onMouseEnter={() => prefetchRoute(item.url)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium",
                  isActive(item.url) ? "bg-primary/8 text-primary" : "text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Global AI Assistant */}
      <AiAssistantWidget />
    </div>
  );
}
