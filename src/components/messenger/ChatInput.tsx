import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, ImageIcon, X } from "lucide-react";
import QuickReactions from "@/components/messenger/QuickReactions";
import GiftPicker from "@/components/messenger/GiftPicker";
import { useSendMessage } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  conversationId: string;
  prefillText?: string;
  onPrefillUsed?: () => void;
  otherUserId?: string;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

export default function ChatInput({ conversationId, prefillText, onPrefillUsed, otherUserId, onTyping, onStopTyping }: Props) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      onPrefillUsed?.();
      textareaRef.current?.focus();
    }
  }, [prefillText]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed && !imagePreview) return;

    let mediaUrl: string | undefined;
    if (imagePreview && imagePreview.startsWith("data:")) {
      setUploading(true);
      try {
        const res = await fetch(imagePreview);
        const blob = await res.blob();
        const filename = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { data } = await supabase.storage.from("post-images").upload(filename, blob, { contentType: blob.type });
        if (data) {
          const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(data.path);
          mediaUrl = urlData.publicUrl;
        }
      } catch { /* ignore */ }
      setUploading(false);
    }

    sendMessage.mutate({ conversationId, text: trimmed || undefined, mediaUrl });
    onStopTyping?.();
    setText("");
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  }, [text, imagePreview, conversationId, sendMessage, onStopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Файл слишком большой (макс. 5 МБ)"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Формат не поддерживается"); return; }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const canSend = (text.trim() || imagePreview) && !uploading && !sendMessage.isPending;

  return (
    <div className="border-t border-border bg-card">
      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <img src={imagePreview} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/80 text-background text-[10px] flex items-center justify-center hover:bg-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-3">
        <QuickReactions
          onReact={(emoji) => {
            sendMessage.mutate({ conversationId, text: emoji });
          }}
          className="shrink-0 mb-1.5"
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-[18px] w-[18px]" />
        </Button>
        {otherUserId && <GiftPicker receiverId={otherUserId} conversationId={conversationId} />}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); if (e.target.value) onTyping?.(); else onStopTyping?.(); }}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение…"
          rows={1}
          className="flex-1 resize-none bg-secondary/60 border border-border/50 rounded-[10px] px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 min-h-[40px] max-h-[120px] leading-snug transition-all"
          style={{ height: "40px" }}
          onInput={(e) => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = "40px";
            el.style.height = Math.min(el.scrollHeight, 120) + "px";
          }}
        />

        <Button
          size="icon"
          className="h-9 w-9 shrink-0 mb-0.5 rounded-[10px] transition-all"
          disabled={!canSend}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
