
-- Vibe Rooms table
CREATE TABLE public.vibe_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  emoji text DEFAULT '💬',
  category text DEFAULT 'general',
  cover_url text,
  is_active boolean DEFAULT true,
  participants_count integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.vibe_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vibe rooms" ON public.vibe_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create vibe rooms" ON public.vibe_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update own rooms" ON public.vibe_rooms FOR UPDATE USING (auth.uid() = created_by);

-- Vibe Room Participants
CREATE TABLE public.vibe_room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.vibe_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.vibe_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room participants" ON public.vibe_room_participants FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.vibe_room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.vibe_room_participants FOR DELETE USING (auth.uid() = user_id);

-- Add mood_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mood_status text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mood_updated_at timestamptz DEFAULT now();
