import { Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const suggestedCommunities = [
  { id: "travel", name: "Любители путешествий", emoji: "✈️", members: 1240, color: "from-emerald-500/10 to-cyan-500/10" },
  { id: "cinema", name: "Кино и сериалы", emoji: "🎬", members: 890, color: "from-violet-500/10 to-purple-500/10" },
  { id: "sport", name: "Спорт и фитнес", emoji: "🏃", members: 1560, color: "from-orange-500/10 to-amber-500/10" },
  { id: "it", name: "IT и технологии", emoji: "💻", members: 2100, color: "from-blue-500/10 to-indigo-500/10" },
  { id: "music", name: "Музыка", emoji: "🎵", members: 760, color: "from-pink-500/10 to-rose-500/10" },
  { id: "food", name: "Гастрономия", emoji: "🍽️", members: 540, color: "from-amber-500/10 to-yellow-500/10" },
];

export default function CommunityMatchingSection() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Знакомства в сообществах</h3>
            <p className="text-[11px] text-muted-foreground">Найдите единомышленников</p>
          </div>
        </div>
        <Link to="/communities">
          <Button variant="ghost" size="sm" className="text-[12px] text-primary gap-1">
            Все <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {suggestedCommunities.map(c => (
          <Link
            key={c.id}
            to="/communities"
            className={`flex items-center gap-2.5 rounded-xl bg-gradient-to-r ${c.color} p-3 hover:scale-[1.02] transition-all group`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-foreground truncate">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.members.toLocaleString()} участников</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
