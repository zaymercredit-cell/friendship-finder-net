import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Sparkles, Target, Calendar, Check, ChevronRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  matchName: string;
  onSendMessage?: (text: string) => void;
  onOpenDatePlanner?: () => void;
}

const journeySteps = [
  { id: 1, icon: Heart, label: "Совпадение", description: "Вы понравились друг другу", done: true },
  { id: 2, icon: MessageCircle, label: "Первое сообщение", description: "AI подскажет, как начать", done: false },
  { id: 3, icon: Sparkles, label: "Темы для разговора", description: "Общие интересы и вопросы", done: false },
  { id: 4, icon: Target, label: "Общие точки", description: "Что вас объединяет", done: false },
  { id: 5, icon: Calendar, label: "Предложить встречу", description: "Идеи для первой встречи", done: false },
];

export default function MatchJourneyCard({ matchName, onSendMessage, onOpenDatePlanner }: Props) {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="premium-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary/[0.06] to-accent/[0.06] px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">Путь знакомства</h3>
            <p className="text-[10px] text-muted-foreground">с {matchName}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-1">
        {journeySteps.map((step, i) => {
          const isActive = step.id === currentStep + 1;
          const isDone = step.id <= currentStep;
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isDone && "opacity-60",
                isActive && "bg-primary/[0.04] border border-primary/10",
                !isDone && !isActive && "opacity-40"
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold",
                isDone && "bg-success/15 text-success",
                isActive && "bg-primary/15 text-primary",
                !isDone && !isActive && "bg-secondary text-muted-foreground"
              )}>
                {isDone ? <Check className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.description}</p>
              </div>
              {isActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-primary"
                  onClick={() => {
                    setCurrentStep(step.id);
                    if (step.id === 5) onOpenDatePlanner?.();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
