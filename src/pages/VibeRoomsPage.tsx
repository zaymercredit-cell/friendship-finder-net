import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Sparkles, MessageCircle, Clock, Zap, Coffee, Music, Plane, Film, Moon, Heart } from "lucide-react";
import { useVibeRooms, useJoinVibeRoom, useCreateVibeRoom } from "@/hooks/useVibeRooms";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const categoryConfig: Record<string, { icon: any; gradient: string }> = {
  cinema: { icon: Film, gradient: "from-purple-500/20 to-pink-500/20" },
  walks: { icon: Coffee, gradient: "from-emerald-500/20 to-teal-500/20" },
  music: { icon: Music, gradient: "from-orange-500/20 to-amber-500/20" },
  travel: { icon: Plane, gradient: "from-sky-500/20 to-blue-500/20" },
  nightchat: { icon: Moon, gradient: "from-indigo-500/20 to-violet-500/20" },
  dating: { icon: Heart, gradient: "from-rose-500/20 to-pink-500/20" },
  general: { icon: MessageCircle, gradient: "from-primary/10 to-accent/10" },
};

// Mock rooms for demo
const mockRooms = [
  { id: "1", name: "Любители кино", emoji: "🎬", description: "Обсуждаем фильмы и сериалы", category: "cinema", participants_count: 24, is_active: true },
  { id: "2", name: "Прогулка сегодня", emoji: "🌳", description: "Кто хочет погулять?", category: "walks", participants_count: 12, is_active: true },
  { id: "3", name: "Кофе вечером", emoji: "☕", description: "Ищу компанию на кофе", category: "walks", participants_count: 8, is_active: true },
  { id: "4", name: "Путешествия", emoji: "✈️", description: "Делимся впечатлениями и планами", category: "travel", participants_count: 31, is_active: true },
  { id: "5", name: "Музыка и концерты", emoji: "🎵", description: "Что слушаете?", category: "music", participants_count: 19, is_active: true },
  { id: "6", name: "Ночные разговоры", emoji: "🌙", description: "Глубокие разговоры после полуночи", category: "nightchat", participants_count: 15, is_active: true },
  { id: "7", name: "Новые знакомства", emoji: "👋", description: "Место для лёгкого общения", category: "dating", participants_count: 42, is_active: true },
  { id: "8", name: "Стартапы и IT", emoji: "💡", description: "Технологии, бизнес, стартапы", category: "general", participants_count: 17, is_active: true },
];

export default function VibeRoomsPage() {
  const { data: dbRooms } = useVibeRooms();
  const joinRoom = useJoinVibeRoom();
  const createRoom = useCreateVibeRoom();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("💬");
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const rooms = (dbRooms && dbRooms.length > 0) ? dbRooms : mockRooms;
  const filtered = filter === "all" ? rooms : rooms.filter(r => r.category === filter);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createRoom.mutateAsync({ name: newName, description: newDesc, emoji: newEmoji, category: "general" });
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
  };

  const categories = [
    { value: "all", label: "Все", icon: Sparkles },
    { value: "dating", label: "Знакомства", icon: Heart },
    { value: "walks", label: "Прогулки", icon: Coffee },
    { value: "cinema", label: "Кино", icon: Film },
    { value: "music", label: "Музыка", icon: Music },
    { value: "travel", label: "Путешествия", icon: Plane },
    { value: "nightchat", label: "Ночные", icon: Moon },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="premium-card p-6 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.04]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[1.5rem] md:text-[1.75rem] font-bold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Vibe Rooms
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Тематические комнаты для знакомств и общения
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 rounded-xl h-10 text-[13px] font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Создать комнату
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Новая Vibe Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <Input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-16 text-center text-xl" maxLength={2} />
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название комнаты" className="flex-1" />
                </div>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Описание (необязательно)" />
                <Button onClick={handleCreate} className="w-full rounded-xl" disabled={!newName.trim()}>
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {categories.map(c => (
          <Button
            key={c.value}
            variant={filter === c.value ? "default" : "secondary"}
            size="sm"
            className="shrink-0 gap-1.5 text-[12px] h-8 rounded-xl"
            onClick={() => setFilter(c.value)}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
          </Button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {filtered.map((room: any) => {
          const cat = categoryConfig[room.category] || categoryConfig.general;
          const CatIcon = cat.icon;
          return (
            <div key={room.id} className="premium-card overflow-hidden group">
              <div className={`h-20 bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{room.emoji}</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">{room.name}</h3>
                    <p className="text-[12px] text-muted-foreground line-clamp-1 mt-0.5">{room.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0 gap-1">
                    <Users className="h-2.5 w-2.5" />
                    {room.participants_count}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    24ч
                  </span>
                  <span className="text-[10px] text-success flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" />
                    Активно
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full gap-1.5 text-[12px] h-9 rounded-xl font-semibold"
                  onClick={() => joinRoom.mutate(room.id)}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Войти в комнату
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 premium-card">
          <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-[17px] font-semibold text-foreground mb-1">Комнат пока нет</h3>
          <p className="text-[13px] text-muted-foreground">Создайте первую Vibe Room!</p>
        </div>
      )}
    </div>
  );
}
