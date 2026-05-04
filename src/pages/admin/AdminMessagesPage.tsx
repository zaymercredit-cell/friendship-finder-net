import { useState } from "react";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { 
  useFlaggedMessages, 
  useFlaggedMessageStats, 
  useUpdateFlaggedMessage,
  getRiskColor,
  getRiskLabel,
  FlaggedMessageStatus,
  RiskLevel,
} from "@/hooks/useFlaggedMessages";
import { 
  MessageSquare, AlertTriangle, CheckCircle2, XCircle, 
  Clock, Loader2, Eye, Ban, Shield
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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

function FlaggedMessageCard({ message, onResolve, onDismiss }: {
  message: any;
  onResolve: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card className={`border ${getRiskColor(message.risk_level)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${getRiskColor(message.risk_level)}`}>
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className={getRiskColor(message.risk_level)}>
                  {getRiskLabel(message.risk_level as RiskLevel)}
                </Badge>
                <Badge variant="outline">{message.reason}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ru })}
                </span>
              </div>
              {message.ai_analysis?.flags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.ai_analysis.flags.map((flag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}
              {message.ai_analysis?.message_preview && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-muted/50 rounded px-2 py-1">
                  "{message.ai_analysis.message_preview}"
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {message.status === "pending" && (
              <>
                <Button variant="outline" size="sm" onClick={onResolve}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Проверено
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {message.status !== "pending" && (
              <Badge variant="outline" className="text-muted-foreground">
                {message.status === "resolved" ? "Проверено" : 
                 message.status === "dismissed" ? "Отклонено" : "На проверке"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMessagesPage() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [tab, setTab] = useState<"pending" | "reviewed" | "all">("pending");
  const { data: stats } = useFlaggedMessageStats();
  const { data: messages, isLoading: messagesLoading } = useFlaggedMessages(
    tab === "all" ? undefined : tab === "pending" ? "pending" : "reviewed"
  );
  const updateMessage = useUpdateFlaggedMessage();

  if (adminLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4"><PageSkeleton /></div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Доступ запрещён</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/10">
          <MessageSquare className="h-8 w-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Модерация сообщений</h1>
          <p className="text-sm text-muted-foreground">Подозрительные и отмеченные сообщения</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="На проверке" 
          value={stats?.pending || 0} 
          icon={Clock}
          variant={stats?.pending && stats.pending > 20 ? "warning" : "default"}
        />
        <StatCard 
          title="Критические" 
          value={stats?.critical || 0} 
          icon={AlertTriangle}
          variant={stats?.critical ? "critical" : "default"}
        />
        <StatCard 
          title="Высокий риск" 
          value={stats?.high || 0} 
          icon={Shield}
          variant={stats?.high && stats.high > 10 ? "warning" : "default"}
        />
        <StatCard 
          title="За сегодня" 
          value={stats?.today || 0} 
          icon={MessageSquare}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            На проверке
            {stats?.pending ? (
              <Badge variant="secondary" className="ml-1">{stats.pending}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Проверенные
          </TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !messages?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Нет сообщений для проверки</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <FlaggedMessageCard
                key={msg.id}
                message={msg}
                onResolve={() => updateMessage.mutate({ id: msg.id, status: "reviewed" })}
                onDismiss={() => updateMessage.mutate({ id: msg.id, status: "dismissed" })}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
