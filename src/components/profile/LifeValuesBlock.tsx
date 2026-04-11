import { Heart, Briefcase, Plane, Baby, Home, Gem, Globe, GraduationCap } from "lucide-react";

const valueIcons: Record<string, { icon: any; color: string; label: string }> = {
  "семья": { icon: Home, color: "bg-rose-500/10 text-rose-500", label: "Семья" },
  "карьера": { icon: Briefcase, color: "bg-blue-500/10 text-blue-500", label: "Карьера" },
  "путешествия": { icon: Plane, color: "bg-emerald-500/10 text-emerald-500", label: "Путешествия" },
  "дети": { icon: Baby, color: "bg-pink-500/10 text-pink-500", label: "Дети" },
  "образование": { icon: GraduationCap, color: "bg-amber-500/10 text-amber-600", label: "Образование" },
  "свобода": { icon: Globe, color: "bg-cyan-500/10 text-cyan-600", label: "Свобода" },
  "саморазвитие": { icon: Gem, color: "bg-violet-500/10 text-violet-500", label: "Саморазвитие" },
};

interface Props {
  values: string[];
  isOwnProfile?: boolean;
}

export default function LifeValuesBlock({ values, isOwnProfile }: Props) {
  if (values.length === 0 && !isOwnProfile) return null;

  return (
    <div className="rounded-2xl border border-border/40 p-5 md:p-6 bg-card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
          <Heart className="h-4 w-4 text-rose-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">Жизненные ценности</h3>
      </div>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map(v => {
            const info = valueIcons[v.toLowerCase()] || { icon: Heart, color: "bg-secondary text-muted-foreground", label: v };
            const Icon = info.icon;
            return (
              <div key={v} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl ${info.color.split(" ")[0]} transition-all hover:scale-105`}>
                <Icon className={`h-4 w-4 ${info.color.split(" ")[1]}`} />
                <span className="text-[13px] font-medium text-foreground">{info.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground/60">Ценности не указаны</p>
      )}
    </div>
  );
}
