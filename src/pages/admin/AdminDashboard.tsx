import { Link } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSafetyAlertStats, getPriorityColor, getPriorityLabel, SafetyAlertPriority } from "@/hooks/useSafetyAlerts";
import { useFlaggedMessageStats } from "@/hooks/useFlaggedMessages";
import { 
  Shield, Users, FileText, UsersRound, CalendarDays, Newspaper, 
  MessageSquare, AlertTriangle, TrendingUp, Activity, Ban, Database,
  Loader2, Zap, Eye, Clock, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const sections = [
  { title: "Пользователи", url: "/admin/users", icon: Users, description: "Управление профилями" },
  { title: "Жалобы", url: "/admin/reports", icon: AlertTriangle, description: "Модерация контента" },
  { title: "Safety Alerts", url: "/admin/safety", icon: Shield, description: "AI-мониторинг безопасности", accent: true },
  { title: "Сообщения", url: "/admin/messages", icon: MessageSquare, description: "Модерация чатов", accent: true },
  { title: "Новости", url: "/admin/news", icon: Newspaper, description: "Публикации" },
  { title: "Сообщества", url: "/admin/communities", icon: UsersRound, description: "Группы и клубы" },
  { title: "События", url: "/admin/events", icon: CalendarDays, description: "Мероприятия" },
  { title: "Seed Data", url: "/admin/seed", icon: Database, description: "Генерация данных" },
];

function StatCard({ title, value, icon: Icon, trend, loading, variant = "default", link }: { 
  title: string; 
  value: number | string; 
  icon: any;
  trend?: string;
  loading?: boolean;
  variant?: "default" | "danger" | "warning" | "success";
  link?: string;
}) {
  const colors = {
    default: "bg-card/50 border-border/60",
    danger: "bg-destructive/5 border-destructive/20",
    warning: "bg-orange-500/5 border-orange-500/20",
    success: "bg-green-500/5 border-green-500/20",
  };

  const iconColors = {
    default: "text-muted-foreground",
    danger: "text-destructive",
    warning: "text-orange-500",
    success: "text-green-500",
  };

  const content = (
    <Card className={`${colors[variant]} transition-all hover:shadow-sm ${link ? "cursor-pointer hover:border-primary/30" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${variant === "danger" ? "text-destructive" : variant === "warning" ? "text-orange-500" : "text-foreground"}`}>
              {value}
            </div>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function LiveActivityItem({ icon: Icon, text, time, variant = "default" }: {
  icon: any;
  text: string;
  time: string;
  variant?: "default" | "warning" | "danger";
}) {
  const colors = {
    default: "text-muted-foreground",
    warning: "text-orange-500",
    danger: "text-destructive",
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className={`p-1.5 rounded-lg bg-secondary ${colors[variant]}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="flex-1 text-sm truncate">{text}</p>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}

function SafetyAlertMini({ alert }: { alert: any }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getPriorityColor(alert.priority)}`}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{alert.reason}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ru })}
        </p>
      </div>
      <Badge variant="outline" className={`shrink-0 ${getPriorityColor(alert.priority)}`}>
        {getPriorityLabel(alert.priority as SafetyAlertPriority)}
      </Badge>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { data: alertStats } = useSafetyAlertStats();
  const { data: msgStats } = useFlaggedMessageStats();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: reportsCount },
        { count: pendingReportsCount },
        { count: messagesCount },
        { count: communitiesCount },
        { count: eventsCount },
        { count: postsCount },
        { count: bannedCount },
        { count: riskUsersCount },
        { count: todayUsersCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("communities").select("*", { count: "exact", head: true }),
        supabase.from("meetups").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("user_bans").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("risk_score", 50),
        supabase.from("profiles").select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      ]);

      return {
        users: usersCount || 0,
        reports: reportsCount || 0,
        pendingReports: pendingReportsCount || 0,
        messages: messagesCount || 0,
        communities: communitiesCount || 0,
        events: eventsCount || 0,
        posts: postsCount || 0,
        banned: bannedCount || 0,
        riskUsers: riskUsersCount || 0,
        todayUsers: todayUsersCount || 0,
      };
    },
    enabled: !!isAdmin,
  });

  // Fetch recent alerts
  const { data: recentAlerts } = useQuery({
    queryKey: ["admin-recent-alerts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("safety_alerts")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Fetch recent reports
  const { data: recentReports } = useQuery({
    queryKey: ["admin-recent-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("*, reporter:profiles!reports_reporter_id_fkey(first_name), reported:profiles!reports_reported_user_id_fkey(first_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!isAdmin,
  });

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Доступ запрещён
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">Центр управления ВДрузьях</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <Zap className="h-3 w-3 mr-1" />
          AI Safety Active
        </Badge>
      </div>

      {/* Critical Alerts Banner */}
      {(alertStats?.critical || 0) > 0 && (
        <Link to="/admin/safety">
          <Card className="bg-destructive/5 border-destructive/30 cursor-pointer hover:bg-destructive/10 transition-colors">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-destructive">
                  {alertStats?.critical} критических алертов требуют внимания
                </p>
                <p className="text-sm text-muted-foreground">Нажмите для просмотра</p>
              </div>
              <Badge variant="destructive">{alertStats?.critical}</Badge>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Пользователи" 
          value={stats?.users || 0} 
          icon={Users} 
          loading={statsLoading}
          trend={`+${stats?.todayUsers || 0} сегодня`}
          link="/admin/users"
        />
        <StatCard 
          title="Жалобы" 
          value={stats?.pendingReports || 0} 
          icon={AlertTriangle} 
          trend={`${stats?.reports || 0} всего`}
          loading={statsLoading}
          variant={stats?.pendingReports && stats.pendingReports > 10 ? "warning" : "default"}
          link="/admin/reports"
        />
        <StatCard 
          title="Safety Alerts" 
          value={alertStats?.open || 0} 
          icon={Shield}
          variant={alertStats?.critical ? "danger" : alertStats?.open && alertStats.open > 5 ? "warning" : "default"}
          trend={`${alertStats?.critical || 0} критических`}
          link="/admin/safety"
        />
        <StatCard 
          title="Флаг. сообщения" 
          value={msgStats?.pending || 0} 
          icon={MessageSquare}
          variant={msgStats?.critical ? "danger" : "default"}
          link="/admin/messages"
        />
        <StatCard 
          title="Риск-профили" 
          value={stats?.riskUsers || 0} 
          icon={Eye}
          variant={stats?.riskUsers && stats.riskUsers > 20 ? "warning" : "default"}
          loading={statsLoading}
          link="/admin/users"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Сообщения" 
          value={stats?.messages || 0} 
          icon={MessageSquare} 
          loading={statsLoading}
        />
        <StatCard 
          title="Сообщества" 
          value={stats?.communities || 0} 
          icon={UsersRound} 
          loading={statsLoading}
          link="/admin/communities"
        />
        <StatCard 
          title="События" 
          value={stats?.events || 0} 
          icon={CalendarDays} 
          loading={statsLoading}
          link="/admin/events"
        />
        <StatCard 
          title="Заблокировано" 
          value={stats?.banned || 0} 
          icon={Ban} 
          loading={statsLoading}
          variant={stats?.banned && stats.banned > 0 ? "default" : "success"}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Safety Alerts */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              Алерты безопасности
            </CardTitle>
            <Link to="/admin/safety">
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Все
              </Badge>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {!recentAlerts?.length ? (
              <div className="py-6 text-center text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Нет открытых алертов
              </div>
            ) : (
              recentAlerts.map((alert: any) => (
                <SafetyAlertMini key={alert.id} alert={alert} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="bg-card/50 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Последние жалобы
            </CardTitle>
            <Link to="/admin/reports">
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                Все
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            {!recentReports?.length ? (
              <div className="py-6 text-center text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Нет новых жалоб
              </div>
            ) : (
              <div className="space-y-1">
                {recentReports.map((report: any) => (
                  <LiveActivityItem
                    key={report.id}
                    icon={AlertTriangle}
                    text={`${report.reporter?.first_name || "Пользователь"} → ${report.reported?.first_name || "Пользователь"}: ${report.reason}`}
                    time={formatDistanceToNow(new Date(report.created_at), { addSuffix: false, locale: ru })}
                    variant="warning"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Управление</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s) => (
            <Link
              key={s.url}
              to={s.url}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm group ${
                s.accent 
                  ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30" 
                  : "border-border bg-card hover:bg-secondary/50"
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                s.accent 
                  ? "bg-primary/10 group-hover:bg-primary/20" 
                  : "bg-secondary group-hover:bg-primary/10"
              }`}>
                <s.icon className={`h-5 w-5 transition-colors ${
                  s.accent 
                    ? "text-primary" 
                    : "text-muted-foreground group-hover:text-primary"
                }`} />
              </div>
              <div>
                <span className="font-medium text-foreground">{s.title}</span>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
