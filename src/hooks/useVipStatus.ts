import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useVipStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vip-status", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("subscriptions" as any)
        .select("id, status, expires_at")
        .eq("user_id", user.id)
        .eq("type", "vip")
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .limit(1);
      return (data && data.length > 0) || false;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}
