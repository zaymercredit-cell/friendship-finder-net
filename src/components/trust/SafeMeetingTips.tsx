import { Shield, MapPin, Users, Phone, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const tips = [
  { icon: MapPin, text: "Встречайтесь в общественных местах", detail: "Выбирайте кафе, парки или торговые центры для первых встреч" },
  { icon: Users, text: "Сообщите друзьям о встрече", detail: "Поделитесь местом и временем встречи с близкими" },
  { icon: Phone, text: "Держите телефон заряженным", detail: "Убедитесь, что можете позвонить в случае необходимости" },
  { icon: AlertTriangle, text: "Доверяйте интуиции", detail: "Если что-то кажется подозрительным — не стесняйтесь уйти" },
];

export default function SafeMeetingTips({ onDismiss }: { onDismiss?: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.03] via-card to-green-500/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-[14px] font-semibold text-foreground">Советы безопасности</h3>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => { setDismissed(true); onDismiss(); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              <tip.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">{tip.text}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{tip.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
