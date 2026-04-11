import { ShieldCheck, Camera, Phone, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  isVerified?: boolean;
}

export default function VerificationBanner({ isVerified }: Props) {
  if (isVerified) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
          <BadgeCheck className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-foreground">Профиль верифицирован</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">Ваша личность подтверждена. Другие пользователи видят значок верификации.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-accent/[0.03] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-foreground">Пройдите верификацию</p>
          <p className="text-[12px] text-muted-foreground">Подтвердите личность и получите значок доверия</p>
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        {[
          { icon: Camera, label: "Подтверждение фото", desc: "Сделайте селфи для проверки" },
          { icon: Phone, label: "Подтверждение телефона", desc: "Привяжите номер телефона" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3">
            <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center shrink-0">
              <step.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">{step.label}</p>
              <p className="text-[11px] text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full gap-2 rounded-full h-10 text-[13px] font-semibold" onClick={() => toast.info("Верификация скоро будет доступна")}>
        Начать верификацию
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
