import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useVibeRooms() {
  return useQuery({
    queryKey: ["vibe-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vibe_rooms" as any)
        .select("*")
        .eq("is_active", true)
        .order("participants_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });
}

export function useJoinVibeRoom() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("vibe_room_participants" as any)
        .insert({ room_id: roomId, user_id: user.id } as any);
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vibe-rooms"] });
      toast.success("Вы вошли в комнату!");
    },
    onError: () => toast.error("Не удалось войти в комнату"),
  });
}

export function useCreateVibeRoom() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { name: string; description: string; emoji: string; category: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("vibe_rooms" as any)
        .insert({ ...params, created_by: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vibe-rooms"] });
      toast.success("Комната создана!");
    },
    onError: () => toast.error("Не удалось создать комнату"),
  });
}
