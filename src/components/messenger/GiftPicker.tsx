import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const GIFTS = [
  { type: "rose", emoji: "🌹", label: "Роза", price: 0 },
  { type: "heart", emoji: "❤️", label: "Сердце", price: 0 },
  { type: "star", emoji: "⭐", label: "Звезда", price: 0 },
  { type: "coffee", emoji: "☕", label: "Кофе", price: 0 },
  { type: "cake", emoji: "🎂", label: "Тортик", price: 0 },
  { type: "diamond", emoji: "💎", label: "Бриллиант", price: 0 },
  { type: "bear", emoji: "🧸", label: "Мишка", price: 0 },
  { type: "fire", emoji: "🔥", label: "Огонь", price: 0 },
];

interface GiftPickerProps {
  receiverId: string;
  conversationId: string;
}

export default function GiftPicker({ receiverId, conversationId }: GiftPickerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const sendGift = async (giftType: string, emoji: string) => {
    if (!user || sending) return;
    setSending(true);
    try {
      await (supabase.from("gifts") as any).insert({
        sender_id: user.id,
        receiver_id: receiverId,
        gift_type: giftType,
        conversation_id: conversationId,
      });
      // Also send as a system-like message
      await supabase.from("messages").insert({
        sender_id: user.id,
        conversation_id: conversationId,
        text: `${emoji} Подарок: ${GIFTS.find(g => g.type === giftType)?.label}`,
        is_system: false,
      });
      toast.success(`${emoji} Подарок отправлен!`);
      setOpen(false);
    } catch {
      toast.error("Не удалось отправить подарок");
    } finally {
      setSending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
          <Gift className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-[13px] font-semibold text-foreground mb-2">Отправить подарок</p>
        <div className="grid grid-cols-4 gap-2">
          {GIFTS.map((g) => (
            <button
              key={g.type}
              onClick={() => sendGift(g.type, g.emoji)}
              disabled={sending}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="text-[10px] text-muted-foreground">{g.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
