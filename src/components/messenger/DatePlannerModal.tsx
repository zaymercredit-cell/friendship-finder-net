import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, MapPin, Send, Sparkles, X, Coffee, TreePine, Palette, Heart, Mountain } from "lucide-react";
import { useDatePlanner, type DateIdea } from "@/hooks/useDatePlanner";
import { useSendMessage } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

const vibeIcons: Record<string, typeof Coffee> = {
  romantic: Heart,
  active: Mountain,
  creative: Palette,
  chill: Coffee,
  adventure: TreePine,
};

const vibeColors: Record<string, string> = {
  romantic: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  creative: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  chill: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  adventure: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};

const timeOptions = [
  { label: "Сегодня", value: "today" },
  { label: "Завтра", value: "tomorrow" },
  { label: "На выходных", value: "weekend" },
];

function getScheduledDate(when: string): string {
  const now = new Date();
  if (when === "today") return now.toISOString();
  if (when === "tomorrow") {
    now.setDate(now.getDate() + 1);
    return now.toISOString();
  }
  // weekend: next Saturday
  const day = now.getDay();
  const diff = day <= 6 ? 6 - day : 0;
  now.setDate(now.getDate() + diff);
  return now.toISOString();
}

export default function DatePlannerModal({
  targetUserId,
  targetName,
  conversationId,
  onClose,
}: {
  targetUserId: string;
  targetName: string;
  conversationId: string;
  onClose: () => void;
}) {
  const { loading, ideas, generate, createDate } = useDatePlanner();
  const sendMessage = useSendMessage();
  const [selectedIdea, setSelectedIdea] = useState<DateIdea | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("tomorrow");
  const [sending, setSending] = useState(false);

  const handleGenerate = () => generate(targetUserId);

  const handleSendInvite = async () => {
    if (!selectedIdea) return;
    setSending(true);

    const scheduledAt = getScheduledDate(selectedTime);
    const timeLabel = timeOptions.find(t => t.value === selectedTime)?.label || "";
    const messageText = `${selectedIdea.emoji} Как насчёт "${selectedIdea.title}"? ${timeLabel.toLowerCase()}${selectedIdea.location ? ` — ${selectedIdea.location}` : ""}`;

    await createDate({
      user2_id: targetUserId,
      idea: selectedIdea.title,
      idea_emoji: selectedIdea.emoji,
      location: selectedIdea.location,
      scheduled_at: scheduledAt,
      message_text: messageText,
    });

    sendMessage.mutate({
      conversationId,
      text: messageText,
    });

    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl sm:rounded-2xl border border-border/50 w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">AI Date Planner</h2>
              <p className="text-[11px] text-muted-foreground">Предложить встречу {targetName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {ideas.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground mb-1">Спланируйте свидание</h3>
              <p className="text-[13px] text-muted-foreground mb-4 max-w-xs mx-auto">
                AI подберёт идеи встречи на основе ваших общих интересов и города
              </p>
              <Button onClick={handleGenerate} className="gap-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                Подобрать идеи
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">AI подбирает идеи для свидания...</p>
            </div>
          )}

          {ideas.length > 0 && !selectedIdea && (
            <>
              <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">Выберите идею</p>
              <div className="space-y-2.5">
                {ideas.map((idea, i) => {
                  const VibeIcon = vibeIcons[idea.vibe] || Coffee;
                  const vibeColor = vibeColors[idea.vibe] || vibeColors.chill;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedIdea(idea)}
                      className="w-full text-left bg-secondary/40 hover:bg-secondary/70 border border-border/40 hover:border-primary/20 rounded-xl p-4 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{idea.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-[14px] font-semibold text-foreground">{idea.title}</h4>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", vibeColor)}>
                              <VibeIcon className="h-2.5 w-2.5 inline mr-0.5" />
                              {idea.vibe}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">{idea.description}</p>
                          {idea.location && (
                            <p className="text-[11px] text-primary flex items-center gap-1 mt-1.5">
                              <MapPin className="h-3 w-3" />{idea.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 text-center">
                <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-[12px] gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />Другие варианты
                </Button>
              </div>
            </>
          )}

          {selectedIdea && (
            <div className="space-y-4">
              {/* Selected idea card */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{selectedIdea.emoji}</span>
                  <div>
                    <h4 className="text-[15px] font-semibold text-foreground">{selectedIdea.title}</h4>
                    <p className="text-[12px] text-muted-foreground">{selectedIdea.description}</p>
                  </div>
                </div>
                {selectedIdea.location && (
                  <p className="text-[12px] text-primary flex items-center gap-1 mt-2">
                    <MapPin className="h-3 w-3" />{selectedIdea.location}
                  </p>
                )}
                <button onClick={() => setSelectedIdea(null)} className="text-[11px] text-muted-foreground hover:text-foreground mt-2 underline">
                  Выбрать другую идею
                </button>
              </div>

              {/* Time selection */}
              <div>
                <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Когда?</p>
                <div className="flex gap-2">
                  {timeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedTime(opt.value)}
                      className={cn(
                        "flex-1 text-[13px] py-2.5 rounded-xl border transition-all font-medium",
                        selectedTime === opt.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-foreground border-border/50 hover:border-primary/30"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety note */}
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-start gap-2.5">
                <span className="text-lg">🛡️</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Встречайтесь в общественных местах и сообщайте друзьям о планах. Ваша безопасность — приоритет.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedIdea && (
          <div className="px-5 py-4 border-t border-border/40 bg-card">
            <Button
              className="w-full gap-2 rounded-xl h-11 text-[14px] font-semibold"
              onClick={handleSendInvite}
              disabled={sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Предложить встречу
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
