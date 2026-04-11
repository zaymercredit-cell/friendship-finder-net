import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function useMyInvite() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-invite", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("invites")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);
      if (data && data.length > 0) return data[0];
      const code = generateCode();
      const { data: newInvite } = await supabase
        .from("invites")
        .insert({ user_id: user.id, invite_code: code })
        .select()
        .single();
      return newInvite;
    },
    enabled: !!user,
  });
}

export function useInviteByCode(code: string | undefined) {
  return useQuery({
    queryKey: ["invite-code", code],
    queryFn: async () => {
      if (!code) return null;
      const { data } = await supabase
        .from("invites")
        .select("*")
        .eq("invite_code", code)
        .limit(1);
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!code,
  });
}
