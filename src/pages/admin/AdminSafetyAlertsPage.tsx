import { useState } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { 
  useSafetyAlerts, 
  useSafetyAlertStats, 
  useUpdateSafetyAlert,
  getPriorityColor,
  getPriorityLabel,
  SafetyAlertPriority,
  SafetyAlertStatus,
} from "@/hooks/useSafetyAlerts";
import { 
  Shield, AlertTriangle, CheckCircle2, XCircle, Clock, 
  User, MessageSquare, Users, CalendarDays, Loader2, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";

function StatCard({ title, value, icon: Icon, variant = "default" }: {
  title: string;
  value: number;
  icon: any;
  variant?: "default" | "critical" | "warning";
}) {
  const colors = {
    default: "bg-card border-border",
    critical: "bg-red-500/5 border-red-500/20",
    warning: "bg-orange-500/5 border-orange-500/20",
  };

  return (
    <Card className={`${colors[variant]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 opacity-20 ${
            variant === "critical" ? "text-red-500" : 
            variant === "warning" ? "text-orange-500" : "text-muted-foreground"
          }`} />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ alert, onResolve, onDismiss }: {
  alert: any;
  onResolve: () => void;
  onDismiss: () => void;
}) {
  const targetIcon = {
    user: User,
    message: MessageSquare,
    community: Users,
    event: CalendarDays,
  }[alert.target_type] || AlertTriangle;

  const Icon = targetIcon;

  return (
    <Card className={`border ${getPriorityColor(alert.priority)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${getPriorityColor(alert.priority)}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                  {getPriorityLabel(alert.priority as SafetyAlertPriority)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ru })}
                </span>
              </div>
              <p className="font-medium text-sm mb-1">{alert.reason}</p>
              {alert.details?.suggested_action && (
                <p className="text-xs text-muted-foreground">
                  Рекомендация: {alert.details.suggested_action}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {alert.target_type === "user" && (
              <Link to={`/profile/${alert.target_id}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {alert.status === "open" && (
              <>
                <Button variant="outline" size="sm" onClick={onResolve}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Решено
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSafetyAlertsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [tab, setTab] = useState<"open" | "resolved" | "all">("open");
  const { data: stats, isLoading: statsLoading } = useSafetyAlertStats();
  const { data: alerts, isLoading: alertsLoading } = useSafetyAlerts(
    tab === "all" ? undefined : tab === "open" ? "open" : "resolved"
  );
  const updateAlert = useUpdateSafetyAlert();

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
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/10">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Safety Monitor</h1>
          <p className="text-sm text-muted-foreground">Алерты безопасности платформы</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Открытые алерты" 
          value={stats?.open || 0} 
          icon={AlertTriangle}
          variant={stats?.open && stats.open > 10 ? "warning" : "default"}
        />
        <StatCard 
          title="Критические" 
          value={stats?.critical || 0} 
          icon={AlertTriangle}
          variant={stats?.critical ? "critical" : "default"}
        />
        <StatCard 
          title="Высокий приоритет" 
          value={stats?.high || 0} 
          icon={Clock}
          variant={stats?.high && stats.high > 5 ? "warning" : "default"}
        />
        <StatCard 
          title="За сегодня" 
          value={stats?.today || 0} 
          icon={Shield}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="open" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Открытые
            {stats?.open ? (
              <Badge variant="secondary" className="ml-1">{stats.open}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Решённые
          </TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {alertsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !alerts?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Нет алертов</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={() => updateAlert.mutate({ id: alert.id, status: "resolved" })}
                onDismiss={() => updateAlert.mutate({ id: alert.id, status: "dismissed" })}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
