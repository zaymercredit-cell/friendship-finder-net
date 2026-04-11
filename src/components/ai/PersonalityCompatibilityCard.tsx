import { useState, useEffect } from "react";
import { Brain, Loader2, Zap, Heart, MessageCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  targetUserId: string;
}

interface CompatResult {
  score: number;
  summary: string;
  dimensions: { label: string; score: number; emoji: string }[];
  communication_style: string;
  tips: string[];
}

export default function PersonalityCompatibilityCard({ targetUserId }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatResult | null>(null);
  const [myType, setMyType] = useState<string | null>(null);
  const [theirType, setTheirType] = useState<string | null>(null);

  useEffect(() => {
    // Load both personality profiles
    if (!user) return;
    (async () => {
      const [myRes, theirRes] = await Promise.all([
        supabase.from("personality_profiles" as any).select("personality_type, traits").eq("user_id", user.id).maybeSingle(),
        supabase.from("personality_profiles" as any).select("personality_type, traits").eq("user_id", targetUserId).maybeSingle(),
      ]);
      setMyType((myRes.data as any)?.personality_type || null);
      setTheirType((theirRes.data as any)?.personality_type || null);
    })();
  }, [user, targetUserId]);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-dating-assistant", {
        body: { type: "personality_compatibility", targetUserId },
      });
      if (error) throw error;
      setResult(data?.data || null);
    } catch {
      // fallback
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (!myType && !theirType) return null; // No personality data

  if (!result && !loading) {
    return (
      <div className="bg-gradient-to-br from-violet-500/10 via-card to-pink-500/5 rounded-2xl border border-violet-500/20 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <h4 className="text-[13px] font-semibold text-foreground">Психологическая совместимость</h4>
        </div>
        <div className="flex items-center gap-3 mb-3">
          {myType && <span className="text-[12px] bg-violet-500/10 text-violet-600 px-2.5 py-1 rounded-full">{myType}</span>}
          {theirType && <span className="text-[12px] bg-pink-500/10 text-pink-600 px-2.5 py-1 rounded-full">{theirType}</span>}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-[12px]" onClick={analyze}>
          <Zap className="h-3.5 w-3.5" />Анализировать совместимость
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-500/10 via-card to-pink-500/5 rounded-2xl border border-violet-500/20 p-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
        <div>
          <p className="text-[13px] font-medium text-foreground">Анализирую психотипы…</p>
          <p className="text-[11px] text-muted-foreground">AI сравнивает личностные профили</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.score >= 80 ? "text-emerald-500" : result.score >= 60 ? "text-violet-500" : "text-muted-foreground";

  return (
    <div className="bg-gradient-to-br from-violet-500/10 via-card to-pink-500/5 rounded-2xl border border-violet-500/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <h4 className="text-[13px] font-semibold text-foreground">Психологическая совместимость</h4>
        </div>
        <span className={`text-2xl font-bold ${scoreColor}`}>{result.score}%</span>
      </div>

      <p className="text-[13px] text-muted-foreground">{result.summary}</p>

      {/* Radar-like dimensions */}
      {result.dimensions && result.dimensions.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {result.dimensions.map((d, i) => (
            <div key={i} className="bg-card/50 rounded-xl p-3 border border-border/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground">{d.emoji} {d.label}</span>
                <span className="text-[12px] font-bold text-foreground">{d.score}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="bg-violet-500 rounded-full h-1.5 transition-all" style={{ width: `${d.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {result.communication_style && (
        <div className="flex items-start gap-2 bg-card/50 rounded-xl p-3 border border-border/30">
          <MessageCircle className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Стиль общения</p>
            <p className="text-[12px] text-foreground">{result.communication_style}</p>
          </div>
        </div>
      )}

      {result.tips && result.tips.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Heart className="h-3 w-3" />Советы для вас
          </p>
          <div className="space-y-1">
            {result.tips.map((t, i) => (
              <p key={i} className="text-[12px] text-foreground/80 pl-3 border-l-2 border-violet-500/30">{t}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
