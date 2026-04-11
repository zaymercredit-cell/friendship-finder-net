import { Activity, Dumbbell, Wine, Bike, Moon, Cigarette, Leaf, Utensils } from "lucide-react";

const lifestyleIcons: Record<string, { icon: any; emoji: string }> = {
  "спорт": { icon: Dumbbell, emoji: "💪" },
  "йога": { icon: Leaf, emoji: "🧘" },
  "бег": { icon: Bike, emoji: "🏃" },
  "не курю": { icon: Cigarette, emoji: "🚭" },
  "не пью": { icon: Wine, emoji: "🚫" },
  "вегетарианец": { icon: Utensils, emoji: "🥗" },
  "жаворонок": { icon: Activity, emoji: "🌅" },
  "сова": { icon: Moon, emoji: "🦉" },
  "активный": { icon: Activity, emoji: "⚡" },
  "домосед": { icon: Moon, emoji: "🏠" },
};

interface Props {
  lifestyle: string[];
  isOwnProfile?: boolean;
}

export default function LifestyleBlock({ lifestyle, isOwnProfile }: Props) {
  if (lifestyle.length === 0 && !isOwnProfile) return null;

  return (
    <div className="rounded-2xl border border-border/40 p-5 md:p-6 bg-card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Activity className="h-4 w-4 text-emerald-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">Образ жизни</h3>
      </div>

      {lifestyle.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {lifestyle.map(item => {
            const info = lifestyleIcons[item.toLowerCase()];
            return (
              <span key={item} className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-secondary/60 text-foreground px-3.5 py-2 rounded-xl hover:bg-secondary transition-colors">
                <span>{info?.emoji || "✨"}</span>
                {item}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground/60">Не указано</p>
      )}
    </div>
  );
}
