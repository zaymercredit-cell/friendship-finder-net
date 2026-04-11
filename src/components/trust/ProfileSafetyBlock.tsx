import { Shield, ShieldCheck, ShieldAlert, CheckCircle2, Calendar, MessageCircle, AlertTriangle, Star, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTrustScore, getTrustLabel } from "@/hooks/useTrustScore";

interface Props {
  profile: {
    avatarUrl?: string | null;
    about?: string | null;
    interests?: string[] | null;
    isVerified?: boolean | null;
    isVip?: boolean | null;
    createdAt?: string | null;
    city?: string | null;
    age?: number | null;
  };
  isOwnProfile?: boolean;
}

function TrustFactor({ label, done, icon: Icon }: { label: string; done: boolean; icon: any }) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-green-500/10" : "bg-secondary"}`}>
        <Icon className={`h-3.5 w-3.5 ${done ? "text-green-500" : "text-muted-foreground/50"}`} />
      </div>
      <span className={`text-[13px] ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
      {done && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto shrink-0" />}
    </div>
  );
}

export default function ProfileSafetyBlock({ profile, isOwnProfile }: Props) {
  const score = useTrustScore(profile);
  const { label, color } = getTrustLabel(score);
  const Icon = score >= 80 ? ShieldCheck : score >= 50 ? Shield : ShieldAlert;

  const factors = [
    { label: "Фото профиля", done: !!profile.avatarUrl, icon: CheckCircle2 },
    { label: "Описание профиля", done: !!(profile.about && profile.about.length > 20), icon: MessageCircle },
    { label: "Интересы указаны", done: !!(profile.interests && profile.interests.length >= 3), icon: Star },
    { label: "Город указан", done: !!profile.city, icon: Calendar },
    { label: "Верификация пройдена", done: !!profile.isVerified, icon: ShieldCheck },
  ];

  const badges: { label: string; variant: "default" | "secondary" | "outline"; icon: any }[] = [];
  if (profile.isVerified) badges.push({ label: "Verified", variant: "default", icon: ShieldCheck });
  if (score >= 80) badges.push({ label: "Trusted Member", variant: "default", icon: Shield });
  if (score >= 50 && !profile.isVerified) badges.push({ label: "Safe Profile", variant: "secondary", icon: Lock });

  return (
    <div className="rounded-2xl border border-border/40 p-5 md:p-6 bg-card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">Безопасность профиля</h3>
      </div>

      {/* Score ring + label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={score >= 80 ? "hsl(142 71% 45%)" : score >= 50 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="6" strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-lg font-bold ${color}`}>{score}%</p>
          <p className="text-[13px] text-muted-foreground">{label}</p>
          <Progress value={score} className="h-1.5 mt-2" />
        </div>
      </div>

      {/* Trust badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map(b => (
            <Badge key={b.label} variant={b.variant} className="gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium">
              <b.icon className="h-3 w-3" />
              {b.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Factor checklist */}
      <div className="divide-y divide-border/30">
        {factors.map(f => (
          <TrustFactor key={f.label} {...f} />
        ))}
      </div>

      {/* Account age */}
      {profile.createdAt && (
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          На платформе с {new Date(profile.createdAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
        </div>
      )}

      {isOwnProfile && score < 80 && (
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-[12px] text-primary font-medium">💡 Заполните профиль полностью, чтобы повысить уровень доверия</p>
        </div>
      )}
    </div>
  );
}
