import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AdminNote {
  id: string;
  target_user_id: string;
  author_id: string;
  note_text: string;
  type: string;
  created_at: string;
}

export function useAdminNotes(targetUserId: string) {
  return useQuery({
    queryKey: ["admin-notes", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notes")
        .select("*")
        .eq("target_user_id", targetUserId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AdminNote[];
    },
    enabled: !!targetUserId,
  });
}

export function useAddAdminNote() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      targetUserId, 
      noteText, 
      type = "general" 
    }: { 
      targetUserId: string; 
      noteText: string; 
      type?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("admin_notes").insert({
        target_user_id: targetUserId,
        author_id: user.id,
        note_text: noteText,
        type,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-notes", variables.targetUserId] });
      toast.success("Заметка добавлена");
    },
    onError: () => toast.error("Не удалось добавить заметку"),
  });
}

export function getNoteTypeLabel(type: string) {
  switch (type) {
    case "warning": return "Предупреждение";
    case "ban": return "Блокировка";
    case "review": return "Проверка";
    default: return "Заметка";
  }
}

export function getNoteTypeColor(type: string) {
  switch (type) {
    case "warning": return "text-yellow-600 bg-yellow-500/10";
    case "ban": return "text-red-600 bg-red-500/10";
    case "review": return "text-blue-600 bg-blue-500/10";
    default: return "text-muted-foreground bg-muted";
  }
}
