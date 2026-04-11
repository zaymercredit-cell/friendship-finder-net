import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Чем увлекается?",
  "Какие фильмы любит?",
  "Какой характер?",
  "Куда любит путешествовать?",
  "Какие цели общения?",
];

export default function AiAvatarChat({
  targetUserId,
  targetName,
  isOnline,
}: {
  targetUserId: string;
  targetName: string;
  isOnline: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-avatar-chat", {
        body: {
          targetUserId,
          question: text.trim(),
          history: messages.slice(-6),
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      setMessages([...newMessages, { role: "assistant", content: data.answer }]);
    } catch (e: any) {
      console.error(e);
      toast.error("AI-аватар временно недоступен");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl border border-primary/15 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-semibold text-foreground">AI-аватар {targetName}</h3>
            <p className="text-[12px] text-muted-foreground">
              {isOnline ? "Можно написать напрямую" : "Узнайте больше, пока пользователь офлайн"}
            </p>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground mb-3">
          AI-аватар расскажет о {targetName} на основе профиля. Задайте вопрос — и узнайте об интересах, увлечениях и целях общения.
        </p>
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="gap-1.5 text-[13px] rounded-full"
        >
          <Bot className="h-3.5 w-3.5" />
          Задать вопрос AI-аватару
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-[13px] font-semibold text-foreground">AI-аватар {targetName}</span>
            <p className="text-[10px] text-muted-foreground">Отвечает на основе профиля</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground mb-3">Спросите что-нибудь о {targetName}</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested follow-ups */}
      {messages.length > 0 && messages.length < 6 && !loading && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {SUGGESTED_QUESTIONS.filter(
            (q) => !messages.some((m) => m.role === "user" && m.content === q)
          )
            .slice(0, 3)
            .map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[10px] bg-secondary/60 hover:bg-secondary text-muted-foreground px-2.5 py-1 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/30 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Спросите об интересах, хобби..."
          className="flex-1 h-9 text-[13px] rounded-full bg-secondary border-0"
          disabled={loading}
        />
        <Button
          size="icon"
          className="h-9 w-9 rounded-full shrink-0"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
