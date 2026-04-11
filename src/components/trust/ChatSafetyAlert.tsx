import { AlertTriangle, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

interface Props {
  otherUserVerified?: boolean;
  otherUserTrustScore?: number;
  isNewConversation?: boolean;
}

export default function ChatSafetyAlert({ otherUserVerified, otherUserTrustScore, isNewConversation }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  // Show verified badge for verified users
  if (otherUserVerified) {
    return (
      <div className="mx-4 mt-2 mb-1 flex items-center gap-2 text-[11px] text-green-600 bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>Верифицированный профиль — личность подтверждена</span>
        <button onClick={() => setDismissed(true)} className="ml-auto shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // Show warning for low trust or new conversations
  if (isNewConversation && otherUserTrustScore && otherUserTrustScore < 40) {
    return (
      <div className="mx-4 mt-2 mb-1 flex items-center gap-2 text-[11px] text-amber-600 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>Будьте осторожны — низкий уровень доверия профиля. Не делитесь личными данными.</span>
        <button onClick={() => setDismissed(true)} className="ml-auto shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return null;
}
