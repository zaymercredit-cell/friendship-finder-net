import { useState } from "react";
import { cn } from "@/lib/utils";

const reactions = ["❤️", "😂", "🔥", "👍", "😍", "🎉", "💯", "🥰"];

interface Props {
  onReact: (emoji: string) => void;
  className?: string;
}

export default function QuickReactions({ onReact, className }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShow(!show)}
        className="text-lg hover:scale-125 transition-transform active:scale-95"
        title="Реакция"
      >
        😊
      </button>
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-[var(--shadow-lg)] animate-fade-in z-50">
          {reactions.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onReact(emoji); setShow(false); }}
              className="text-xl hover:scale-125 transition-transform active:scale-90 px-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
