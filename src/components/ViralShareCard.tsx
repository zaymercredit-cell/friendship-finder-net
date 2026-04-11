import { Button } from "@/components/ui/button";
import { Share2, Sparkles, Heart, Trophy, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

type ViralMoment = {
  type: "match" | "verified" | "achievement" | "event" | "community";
  title: string;
  subtitle: string;
  emoji: string;
};

const viralMoments: ViralMoment[] = [
  { type: "match", title: "Новое совпадение!", subtitle: "Поделись радостью с друзьями", emoji: "💕" },
  { type: "verified", title: "Профиль подтверждён", subtitle: "Теперь ваш профиль заслуживает доверия", emoji: "✅" },
  { type: "achievement", title: "Новое достижение!", subtitle: "Вы стали активнее на платформе", emoji: "🏆" },
  { type: "event", title: "Вы идёте на событие", subtitle: "Пригласите друзей составить компанию", emoji: "🎉" },
  { type: "community", title: "Популярное сообщество", subtitle: "Вы в тренде этой недели", emoji: "🌟" },
];

const iconMap = { match: Heart, verified: Sparkles, achievement: Trophy, event: Calendar, community: Users };

export default function ViralShareCard({ moment }: { moment?: ViralMoment }) {
  const m = moment || viralMoments[Math.floor(Math.random() * viralMoments.length)];
  const Icon = iconMap[m.type];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `ВДрузьях — ${m.title}`,
        text: m.subtitle,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success("Ссылка скопирована!");
    }
  };

  return (
    <div className="premium-card overflow-hidden group">
      <div className="bg-gradient-to-r from-primary/[0.06] via-accent/[0.04] to-primary/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-2xl shrink-0">
            {m.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-foreground">{m.title}</p>
            <p className="text-[12px] text-muted-foreground">{m.subtitle}</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 gap-1.5 rounded-xl h-9 text-[12px]" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
            Поделиться
          </Button>
        </div>
      </div>
    </div>
  );
}
