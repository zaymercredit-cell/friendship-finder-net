import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useMeetups() {
  return useQuery({
    queryKey: ["meetups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useMeetupDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["meetup", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useMeetupParticipants(meetupId: string | undefined) {
  return useQuery({
    queryKey: ["meetup-participants", meetupId],
    enabled: !!meetupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetup_participants")
        .select("*, profiles:user_id(first_name, last_name, avatar_url, username, city, is_online)")
        .eq("meetup_id", meetupId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useJoinMeetup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meetupId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("meetup_participants")
        .insert({ meetup_id: meetupId, user_id: user.id } as any);
      if (error) throw error;
    },
    onSuccess: (_, meetupId) => {
      qc.invalidateQueries({ queryKey: ["meetup-participants", meetupId] });
      qc.invalidateQueries({ queryKey: ["meetups"] });
      toast.success("Вы присоединились к событию!");
    },
    onError: () => toast.error("Не удалось присоединиться"),
  });
}

export function useLeaveMeetup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meetupId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("meetup_participants")
        .delete()
        .eq("meetup_id", meetupId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, meetupId) => {
      qc.invalidateQueries({ queryKey: ["meetup-participants", meetupId] });
      qc.invalidateQueries({ queryKey: ["meetups"] });
      toast.success("Вы покинули событие");
    },
  });
}

export function useCreateMeetup() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meetup: {
      title: string;
      description: string;
      city: string;
      start_time: string;
      max_participants?: number;
      tags?: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("meetups")
        .insert({ ...meetup, host_user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetups"] });
      toast.success("Событие создано!");
    },
    onError: () => toast.error("Не удалось создать событие"),
  });
}
