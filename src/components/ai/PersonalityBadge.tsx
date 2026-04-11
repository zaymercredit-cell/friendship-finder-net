import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId: string;
  className?: string;
}

export default function PersonalityBadge({ userId, className = "" }: Props) {
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("personality_profiles" as any)
        .select("personality_type")
        .eq("user_id", userId)
        .maybeSingle();
      setType((data as any)?.personality_type || null);
    })();
  }, [userId]);

  if (!type) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded-full font-medium ${className}`}>
      <Brain className="h-3 w-3" />{type}
    </span>
  );
}
