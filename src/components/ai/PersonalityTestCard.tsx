import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const questions = [
  {
    id: "social",
    text: "Как вы предпочитаете проводить вечер?",
    options: [
      { label: "В шумной компании друзей", value: "extrovert", emoji: "🎉" },
      { label: "Уютно дома с книгой или фильмом", value: "introvert", emoji: "📖" },
      { label: "В небольшой тёплой компании", value: "ambivert", emoji: "☕" },
    ],
  },
  {
    id: "planning",
    text: "Как вы относитесь к планам?",
    options: [
      { label: "Люблю всё планировать заранее", value: "planner", emoji: "📋" },
      { label: "Предпочитаю спонтанность", value: "spontaneous", emoji: "🎲" },
      { label: "Зависит от ситуации", value: "flexible", emoji: "⚖️" },
    ],
  },
  {
    id: "energy",
    text: "Какой отдых вам ближе?",
    options: [
      { label: "Активный: спорт, походы, путешествия", value: "active", emoji: "🏔️" },
      { label: "Спокойный: книги, кафе, природа", value: "calm", emoji: "🌿" },
      { label: "Микс: зависит от настроения", value: "balanced", emoji: "🌊" },
    ],
  },
  {
    id: "communication",
    text: "Какой стиль общения вам ближе?",
    options: [
      { label: "Глубокие разговоры о жизни", value: "deep", emoji: "💭" },
      { label: "Лёгкий юмор и веселье", value: "light", emoji: "😄" },
      { label: "Обсуждение идей и проектов", value: "intellectual", emoji: "💡" },
    ],
  },
  {
    id: "values",
    text: "Что для вас важнее в отношениях?",
    options: [
      { label: "Доверие и надёжность", value: "trust", emoji: "🤝" },
      { label: "Страсть и эмоции", value: "passion", emoji: "❤️‍🔥" },
      { label: "Свобода и взаимоуважение", value: "freedom", emoji: "🕊️" },
    ],
  },
];

const personalityTypes: Record<string, { type: string; emoji: string; description: string }> = {
  "extrovert-spontaneous-active-light-passion": { type: "Энергичный искатель приключений", emoji: "🚀", description: "Вы — душа компании, любите новые впечатления и заряжаете энергией окружающих." },
  "introvert-planner-calm-deep-trust": { type: "Спокойный аналитик", emoji: "🧠", description: "Вы цените глубину, надёжность и осмысленные отношения." },
  "ambivert-flexible-balanced-intellectual-freedom": { type: "Гармоничный мыслитель", emoji: "⚖️", description: "Вы умеете адаптироваться и ищете интеллектуальную связь с людьми." },
  "extrovert-planner-active-intellectual-trust": { type: "Целеустремлённый лидер", emoji: "🎯", description: "Вы — организатор и вдохновитель, строите крепкие связи." },
  "introvert-spontaneous-calm-light-freedom": { type: "Творческий мечтатель", emoji: "🎨", description: "Вы живёте в своём ритме и цените лёгкость в отношениях." },
};

function getPersonalityType(answers: Record<string, string>) {
  const key = `${answers.social}-${answers.planning}-${answers.energy}-${answers.communication}-${answers.values}`;
  if (personalityTypes[key]) return personalityTypes[key];

  // Fallback: determine by dominant traits
  const traits = Object.values(answers);
  if (traits.includes("extrovert") && traits.includes("active")) {
    return { type: "Энергичный искатель приключений", emoji: "🚀", description: "Вы — душа компании, любите новые впечатления и заряжаете энергией окружающих." };
  }
  if (traits.includes("introvert") && traits.includes("deep")) {
    return { type: "Эмоциональный романтик", emoji: "💫", description: "Вы цените глубокие чувства и искренние отношения." };
  }
  if (traits.includes("intellectual") || traits.includes("planner")) {
    return { type: "Вдумчивый стратег", emoji: "🧩", description: "Вы ищете осмысленные связи и интеллектуальных партнёров." };
  }
  if (traits.includes("spontaneous") && traits.includes("light")) {
    return { type: "Творческий оптимист", emoji: "🌈", description: "Вы легки в общении и умеете находить радость в мелочах." };
  }
  return { type: "Социальный исследователь", emoji: "🔭", description: "Вы открыты новому и с интересом изучаете мир людей." };
}

interface Props {
  onComplete?: (personality: { type: string; emoji: string; traits: Record<string, string> }) => void;
  compact?: boolean;
}

export default function PersonalityTestCard({ onComplete, compact = false }: Props) {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ type: string; emoji: string; description: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);

  const progress = (currentQ / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All done
      const personality = getPersonalityType(newAnswers);
      setResult(personality);
      saveResult(newAnswers, personality);
    }
  };

  const saveResult = async (ans: Record<string, string>, personality: { type: string; emoji: string; description: string }) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("personality_profiles" as any).upsert({
        user_id: user.id,
        personality_type: personality.type,
        traits: ans,
        answers: Object.entries(ans).map(([q, a]) => ({ question: q, answer: a })),
      } as any, { onConflict: "user_id" });
      if (error) throw error;
      onComplete?.({ type: personality.type, emoji: personality.emoji, traits: ans });
      toast.success("Психологический профиль сохранён!");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить результат");
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-2xl border border-primary/20 p-6 text-center space-y-3">
        <span className="text-5xl">{result.emoji}</span>
        <h3 className="text-lg font-bold text-foreground">{result.type}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{result.description}</p>
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {Object.entries(answers).map(([key, val]) => (
            <span key={key} className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{val}</span>
          ))}
        </div>
        {saving && <p className="text-[11px] text-muted-foreground">Сохранение...</p>}
      </div>
    );
  }

  if (!started) {
    return (
      <div className={`bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl border border-primary/15 p-${compact ? '4' : '6'} text-center space-y-3`}>
        <Brain className="h-10 w-10 text-primary mx-auto" />
        <h3 className="text-[15px] font-bold text-foreground">Тест личности</h3>
        <p className="text-[13px] text-muted-foreground">5 вопросов • 1 минута • узнайте свой психотип</p>
        <Button size="sm" className="gap-1.5" onClick={() => setStarted(true)}>
          <Sparkles className="h-3.5 w-3.5" />Начать тест
        </Button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl border border-primary/15 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-semibold text-foreground">Тест личности</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{currentQ + 1}/{questions.length}</span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <p className="text-[15px] font-medium text-foreground">{q.text}</p>
      <div className="space-y-2">
        {q.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-[14px] text-foreground font-medium">{opt.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}
