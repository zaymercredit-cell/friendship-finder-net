import { useMyInvite } from "@/hooks/useInvites";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Share2, Users, Crown, Check, Heart, Zap, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const rewards = [
  { emoji: "👑", title: "7 дней VIP", desc: "За каждого друга", icon: Crown },
  { emoji: "❤️", title: "+10 симпатий", desc: "Дополнительный бонус", icon: Heart },
  { emoji: "⚡", title: "Boost профиля", desc: "За 3 друзей", icon: Zap },
  { emoji: "⭐", title: "Super Like", desc: "За 5 друзей", icon: Star },
];

export default function InvitePage() {
  const { profile } = useAuth();
  const { data: invite, isLoading } = useMyInvite();
  const [copied, setCopied] = useState(false);
  const uses = invite?.uses || 0;

  const inviteUrl = invite ? `${window.location.origin}/invite/${invite.invite_code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Ссылка скопирована!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "ВДрузьях — присоединяйся!",
        text: `${profile?.first_name} приглашает тебя в ВДрузьях — социальную сеть знакомств!`,
        url: inviteUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Hero */}
      <div className="premium-card overflow-hidden">
        <div className="bg-gradient-to-br from-primary/[0.06] via-accent/[0.04] to-primary/[0.06] p-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Пригласи друзей</h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">Получай бонусы за каждого приглашённого</p>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-muted-foreground">Прогресс приглашений</span>
            <span className="text-[13px] font-bold text-foreground">{uses}/5</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (uses / 5) * 100)}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {uses >= 5 ? "🎉 Все награды получены!" : `Ещё ${5 - uses} до полной награды`}
          </p>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="premium-card p-5 space-y-3">
        <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Что вы получите
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {rewards.map((r, i) => {
            const unlocked = uses >= (i + 1);
            return (
              <div key={r.title} className={`rounded-xl p-3 text-center transition-all ${unlocked ? "bg-primary/8 border border-primary/20" : "bg-secondary/50"}`}>
                <span className="text-2xl">{r.emoji}</span>
                <p className={`text-[12px] font-semibold mt-1 ${unlocked ? "text-primary" : "text-foreground"}`}>{r.title}</p>
                <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                {unlocked && <Check className="h-3.5 w-3.5 text-success mx-auto mt-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite link */}
      <div className="premium-card p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-foreground">Ваша ссылка приглашения</h3>
        {isLoading ? (
          <div className="h-10 bg-secondary rounded-lg shimmer" />
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-[13px] text-foreground truncate font-mono">
                {inviteUrl}
              </div>
              <Button size="sm" variant="outline" className="shrink-0 gap-1.5 rounded-xl" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Скопировано" : "Копировать"}
              </Button>
            </div>
            <Button className="w-full gap-2 rounded-xl h-11 text-[14px] font-semibold shadow-sm active:scale-[0.98] transition-transform" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Поделиться ссылкой
            </Button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-secondary/70 flex items-center justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <span className="text-[14px] font-semibold text-foreground">Приглашено друзей</span>
              <p className="text-[11px] text-muted-foreground">Всего за всё время</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[16px] font-bold px-3 py-1">
            {uses}
          </Badge>
        </div>
      </div>
    </div>
  );
}
