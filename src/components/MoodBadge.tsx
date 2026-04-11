import { cn } from "@/lib/utils";

const moodOptions = [
  { value: "chatty", emoji: "💬", label: "Хочу общаться" },
  { value: "walk", emoji: "🌳", label: "Ищу прогулку" },
  { value: "open", emoji: "👋", label: "Открыт к знакомствам" },
  { value: "event", emoji: "🎉", label: "Хочу на событие" },
  { value: "evening", emoji: "🌙", label: "Общаюсь вечером" },
  { value: "coffee", emoji: "☕", label: "Хочу кофе" },
  { value: "chill", emoji: "🎧", label: "Спокойный отдых" },
];

export { moodOptions };

interface Props {
  mood?: string;
  compact?: boolean;
  className?: string;
}

export default function MoodBadge({ mood, compact = false, className }: Props) {
  if (!mood) return null;
  const found = moodOptions.find(m => m.value === mood);
  if (!found) return null;

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md", className)}>
        {found.emoji}
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg",
      "bg-gradient-to-r from-primary/5 to-accent/5 text-foreground border border-primary/10",
      className
    )}>
      <span>{found.emoji}</span>
      <span>{found.label}</span>
    </span>
  );
}
