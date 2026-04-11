import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDates } from "@/hooks/useDatePlanner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Check, X, MapPin, Clock, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает ответа", color: "bg-amber-500/10 text-amber-600" },
  accepted: { label: "Подтверждено", color: "bg-success/10 text-success" },
  declined: { label: "Отклонено", color: "bg-destructive/10 text-destructive" },
  completed: { label: "Состоялось", color: "bg-primary/10 text-primary" },
};

function DateCard({ date, userId, onAccept, onDecline }: {
  date: any; userId: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const isInviter = date.user1_id === userId;
  const otherUserId = isInviter ? date.user2_id : date.user1_id;

  const { data: otherProfile } = useQuery({
    queryKey: ["date-profile", otherUserId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("first_name, last_name, avatar_url, username").eq("user_id", otherUserId).single();
      return data;
    },
  });

  const status = statusLabels[date.status] || statusLabels.pending;
  const scheduledDate = date.scheduled_at ? new Date(date.scheduled_at) : null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-[var(--shadow-md)] transition-all">
      <div className="flex items-start gap-4">
        <Link to={`/profile/${otherProfile?.username || "me"}`}>
          <Avatar className="h-12 w-12 ring-2 ring-border/30">
            <AvatarImage src={otherProfile?.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-secondary">{otherProfile?.first_name?.[0] || "?"}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{date.idea_emoji || "☕"}</span>
            <h3 className="text-[15px] font-semibold text-foreground">{date.idea}</h3>
          </div>
          <p className="text-[13px] text-muted-foreground">
            {isInviter ? "Вы пригласили" : "Приглашение от"}{" "}
            <span className="font-medium text-foreground">
              {otherProfile?.first_name} {otherProfile?.last_name}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2.5">
            {scheduledDate && (
              <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {scheduledDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              </span>
            )}
            {date.location && (
              <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{date.location}
              </span>
            )}
            <span className={cn("text-[11px] px-2.5 py-0.5 rounded-full font-medium", status.color)}>
              {status.label}
            </span>
          </div>

          {date.status === "pending" && !isInviter && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="gap-1.5 text-[12px] rounded-full h-8" onClick={() => onAccept(date.id)}>
                <Check className="h-3.5 w-3.5" />Принять
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-[12px] rounded-full h-8" onClick={() => onDecline(date.id)}>
                <X className="h-3.5 w-3.5" />Отклонить
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DatesPage() {
  const { user } = useAuth();
  const { dates, loading, fetchDates, updateStatus } = useDates();

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const upcoming = dates.filter(d => d.status === "pending" || d.status === "accepted");
  const past = dates.filter(d => d.status === "completed" || d.status === "declined");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">Встречи</h1>
          <p className="text-[13px] text-muted-foreground">Планируйте свидания с помощью AI</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary/50" />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground mb-1">Встреч пока нет</h3>
          <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
            Откройте любой диалог в мессенджере и нажмите «Предложить встречу» — AI подберёт идеальное свидание
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">Предстоящие</h2>
              {upcoming.map(d => (
                <DateCard
                  key={d.id}
                  date={d}
                  userId={user?.id || ""}
                  onAccept={(id) => updateStatus(id, "accepted")}
                  onDecline={(id) => updateStatus(id, "declined")}
                />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-[14px] font-semibold text-foreground uppercase tracking-wider">История</h2>
              {past.map(d => (
                <DateCard
                  key={d.id}
                  date={d}
                  userId={user?.id || ""}
                  onAccept={() => {}}
                  onDecline={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
