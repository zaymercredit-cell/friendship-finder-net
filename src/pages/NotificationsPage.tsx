import { mockNotifications, mockUsers } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, MessageCircle, UserPlus, UserCheck, CalendarDays, CheckCheck, Sparkles,
  Bell, Users, Eye, Gift, Trophy, Zap, MapPin, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const typeIcons: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  friend_request: UserPlus,
  friend_accept: UserCheck,
  message_request: MessageCircle,
  event: CalendarDays,
  match: Sparkles,
  sympathy: Heart,
  community_invite: Users,
  event_invite: CalendarDays,
  profile_view: Eye,
  achievement: Trophy,
  boost: Zap,
  nearby: MapPin,
  super_like: Star,
};

const typeColors: Record<string, string> = {
  like: "text-destructive bg-destructive/10",
  comment: "text-primary bg-primary/10",
  friend_request: "text-success bg-success/10",
  friend_accept: "text-success bg-success/10",
  message_request: "text-primary bg-primary/10",
  event: "text-accent bg-accent/10",
  match: "text-primary bg-primary/10",
  sympathy: "text-destructive bg-destructive/10",
  community_invite: "text-accent bg-accent/10",
  event_invite: "text-warning bg-warning/10",
  profile_view: "text-muted-foreground bg-secondary",
  achievement: "text-warning bg-warning/10",
  boost: "text-primary bg-primary/10",
  nearby: "text-success bg-success/10",
  super_like: "text-warning bg-warning/10",
};

const extendedNotifications = [
  ...mockNotifications,
  { id: "n11", type: "profile_view" as const, user: mockUsers[10], text: "посмотрел(а) ваш профиль", time: "30 мин назад", read: false },
  { id: "n12", type: "profile_view" as const, user: mockUsers[12], text: "посмотрел(а) ваш профиль", time: "1 час назад", read: false },
  { id: "n13", type: "nearby" as const, user: mockUsers[8], text: "находится рядом с вами прямо сейчас", time: "Только что", read: false },
  { id: "n14", type: "super_like" as const, user: mockUsers[6], text: "отправил(а) вам Super Like ⭐", time: "2 часа назад", read: false },
  { id: "n15", type: "achievement" as const, user: mockUsers[0], text: "Вы получили достижение «Популярный профиль» 🏆", time: "Сегодня", read: false },
  { id: "n16", type: "boost" as const, user: mockUsers[0], text: "Ваш профиль был показан 5x больше людей ⚡", time: "Вчера", read: true },
  { id: "n17", type: "community_invite" as const, user: mockUsers[14], text: "приглашает вас в сообщество «Путешественники России»", time: "4 дня назад", read: true },
  { id: "n18", type: "event_invite" as const, user: mockUsers[16], text: "приглашает вас на «Yoga на крыше»", time: "5 дней назад", read: true },
  { id: "n19", type: "sympathy" as const, user: mockUsers[18], text: "поставила вам симпатию ❤️", time: "5 дней назад", read: true },
  { id: "n20", type: "match" as const, user: mockUsers[22], text: "у вас взаимная симпатия! Начните общение", time: "Неделю назад", read: true },
];

export default function NotificationsPage() {
  const unreadCount = extendedNotifications.filter(n => !n.read).length;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-foreground">Уведомления</h1>
              {unreadCount > 0 && (
                <p className="text-[12px] text-primary font-medium">{unreadCount} новых</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-[12px] gap-1.5 text-muted-foreground rounded-xl">
            <CheckCheck className="h-3.5 w-3.5" />
            Прочитать все
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Eye, label: "Просмотры", value: "12", color: "text-muted-foreground", bg: "bg-secondary/60" },
          { icon: Heart, label: "Симпатии", value: "4", color: "text-destructive", bg: "bg-destructive/5" },
          { icon: Sparkles, label: "Совпадения", value: "2", color: "text-primary", bg: "bg-primary/5" },
          { icon: MessageCircle, label: "Сообщения", value: "8", color: "text-accent", bg: "bg-accent/5" },
        ].map(s => (
          <div key={s.label} className={cn("premium-card p-3 text-center", s.bg)}>
            <s.icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
            <p className="text-[16px] font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full bg-card border border-border/40 rounded-xl h-11 p-1">
          <TabsTrigger value="all" className="flex-1 text-[12px] gap-1.5 rounded-lg data-[state=active]:shadow-sm">
            <Bell className="h-3.5 w-3.5" />Все
          </TabsTrigger>
          <TabsTrigger value="dating" className="flex-1 text-[12px] gap-1.5 rounded-lg data-[state=active]:shadow-sm">
            <Heart className="h-3.5 w-3.5" />Знакомства
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 text-[12px] gap-1.5 rounded-lg data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" />Социальное
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex-1 text-[12px] gap-1.5 rounded-lg data-[state=active]:shadow-sm">
            <Zap className="h-3.5 w-3.5" />Рост
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3">
          <NotificationList notifications={extendedNotifications} />
        </TabsContent>
        <TabsContent value="dating" className="mt-3">
          <NotificationList notifications={extendedNotifications.filter(n => ["sympathy", "match", "like", "super_like", "nearby"].includes(n.type))} />
        </TabsContent>
        <TabsContent value="social" className="mt-3">
          <NotificationList notifications={extendedNotifications.filter(n => ["friend_request", "friend_accept", "community_invite", "event_invite", "event", "comment", "message_request"].includes(n.type))} />
        </TabsContent>
        <TabsContent value="growth" className="mt-3">
          <NotificationList notifications={extendedNotifications.filter(n => ["profile_view", "achievement", "boost"].includes(n.type))} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({ notifications }: { notifications: typeof extendedNotifications }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 premium-card">
        <Bell className="h-12 w-12 text-muted-foreground/15 mx-auto mb-3" />
        <p className="text-[14px] font-medium text-foreground mb-1">Пока нет уведомлений</p>
        <p className="text-[12px] text-muted-foreground">Они появятся, когда кто-то проявит интерес</p>
      </div>
    );
  }

  // Group by today/earlier
  const today = notifications.filter(n => !n.read);
  const earlier = notifications.filter(n => n.read);

  return (
    <div className="space-y-3">
      {today.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wider px-1 mb-2">Новые</p>
          <div className="premium-card divide-y divide-border/30">
            {today.map((notif) => <NotificationItem key={notif.id} notif={notif} />)}
          </div>
        </div>
      )}
      {earlier.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Ранее</p>
          <div className="premium-card divide-y divide-border/30">
            {earlier.map((notif) => <NotificationItem key={notif.id} notif={notif} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notif }: { notif: typeof extendedNotifications[0] }) {
  const Icon = typeIcons[notif.type] || Heart;
  const colorClass = typeColors[notif.type] || "text-primary bg-primary/10";
  const [textColor, bgColor] = colorClass.split(' ');

  return (
    <div className={cn(
      "flex items-center gap-3 p-3.5 transition-colors hover:bg-secondary/30",
      !notif.read && "bg-primary/[0.02]"
    )}>
      <div className="relative shrink-0">
        <Link to={`/profile/${notif.user.username}`}>
          <Avatar className="h-11 w-11 ring-1 ring-border/20">
            <AvatarImage src={notif.user.avatar} alt={notif.user.name} className="object-cover" />
            <AvatarFallback className="text-[12px]">{notif.user.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className={cn("absolute -bottom-1 -right-1 h-5.5 w-5.5 rounded-full flex items-center justify-center border-2 border-card", bgColor)}>
          <Icon className={cn("h-3 w-3", textColor)} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground leading-snug">
          <Link to={`/profile/${notif.user.username}`} className="font-semibold hover:underline">{notif.user.name}</Link>{" "}
          <span className="text-muted-foreground">{notif.text}</span>
        </p>
        <span className="text-[11px] text-muted-foreground/70">{notif.time}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!notif.read && (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        )}
        {notif.type === "friend_request" && (
          <Button size="sm" className="h-8 text-[11px] rounded-xl px-3">Принять</Button>
        )}
        {notif.type === "match" && (
          <Button size="sm" className="h-8 text-[11px] rounded-xl px-3 gap-1">
            <MessageCircle className="h-3 w-3" />Написать
          </Button>
        )}
        {notif.type === "super_like" && (
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl px-3 gap-1 border-warning/30 text-warning">
            <Star className="h-3 w-3" />Ответить
          </Button>
        )}
        {(notif.type === "community_invite" || notif.type === "event_invite") && (
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl px-3">Перейти</Button>
        )}
        {notif.type === "profile_view" && (
          <Link to={`/profile/${notif.user.username}`}>
            <Button size="sm" variant="ghost" className="h-8 text-[11px] rounded-xl px-3">Смотреть</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
