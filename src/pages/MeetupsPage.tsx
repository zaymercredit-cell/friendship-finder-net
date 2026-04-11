import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays, MapPin, Users, Plus, Search, Clock, ArrowLeft, MessageCircle, Check
} from "lucide-react";
import { useMeetups, useMeetupDetail, useMeetupParticipants, useJoinMeetup, useLeaveMeetup } from "@/hooks/useMeetups";
import { useAuth } from "@/contexts/AuthContext";
import { mockEvents } from "@/lib/mock-data";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeetup } from "@/hooks/useMeetups";

function CreateMeetupDialog() {
  const [open, setOpen] = useState(false);
  const createMeetup = useCreateMeetup();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxP, setMaxP] = useState("50");

  const handleCreate = async () => {
    if (!title || !date || !time) return;
    const start_time = new Date(`${date}T${time}`).toISOString();
    await createMeetup.mutateAsync({ title, description, city, start_time, max_participants: parseInt(maxP) || 50 });
    setOpen(false);
    setTitle(""); setDescription(""); setCity(""); setDate(""); setTime("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Создать
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новое событие</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Название</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" placeholder="Speed Dating Friday" /></div>
          <div><Label className="text-xs">Описание</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1" rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Город</Label><Input value={city} onChange={e => setCity(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Макс. участников</Label><Input type="number" value={maxP} onChange={e => setMaxP(e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Дата</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Время</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" /></div>
          </div>
          <Button onClick={handleCreate} disabled={createMeetup.isPending} className="w-full">
            {createMeetup.isPending ? "Создаём..." : "Создать событие"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MeetupsList() {
  const navigate = useNavigate();
  const { data: dbMeetups, isLoading } = useMeetups();
  const [search, setSearch] = useState("");

  // Combine DB meetups with mock data for demo
  const allMeetups = [
    ...(dbMeetups || []).map(m => ({
      id: m.id,
      title: m.title,
      description: m.description || "",
      date: format(new Date(m.start_time), "d MMMM yyyy", { locale: ru }),
      time: format(new Date(m.start_time), "HH:mm"),
      city: m.city || "",
      tags: (m.tags as string[]) || [],
      attendees: 0,
      isGoing: false,
      isDb: true,
    })),
    ...mockEvents.map(e => ({ ...e, isDb: false })),
  ];

  const filtered = allMeetups.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Встречи и события</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Знакомьтесь и общайтесь вживую</p>
        </div>
        <div className="flex gap-2">
          <Link to="/people-nearby">
            <Button variant="outline" size="sm" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              Рядом
            </Button>
          </Link>
          <CreateMeetupDialog />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Найти событие..." className="pl-9 bg-card border-border" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-card rounded-lg shadow-card border border-border p-4 hover:shadow-elevated transition-shadow cursor-pointer"
            onClick={() => event.isDb ? navigate(`/meetups/${event.id}`) : undefined}
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.date} · {event.time}</span>
                  {event.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>}
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.attendees} участников</span>
                </div>
                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {event.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant={event.isGoing ? "default" : "secondary"}
                className="shrink-0 gap-1 text-xs h-8"
              >
                {event.isGoing && <Check className="h-3.5 w-3.5" />}
                {event.isGoing ? "Пойду" : "Хочу пойти"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Событий не найдено</h3>
          <p className="text-sm text-muted-foreground">Создайте своё событие или измените поиск</p>
        </div>
      )}
    </div>
  );
}

function MeetupDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: meetup, isLoading } = useMeetupDetail(id);
  const { data: participants } = useMeetupParticipants(id);
  const joinMeetup = useJoinMeetup();
  const leaveMeetup = useLeaveMeetup();

  const isJoined = participants?.some((p: any) => p.user_id === user?.id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Событие не найдено</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/meetups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Все события
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/meetups")} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Все события
      </Button>

      <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-4">
        <h1 className="text-xl font-bold text-foreground">{meetup.title}</h1>
        {meetup.description && (
          <p className="text-sm text-muted-foreground">{meetup.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary" />
            {format(new Date(meetup.start_time), "d MMMM yyyy, HH:mm", { locale: ru })}
          </span>
          {meetup.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {meetup.city}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            {participants?.length || 0} / {meetup.max_participants}
          </span>
        </div>

        <div className="flex gap-2">
          {isJoined ? (
            <Button variant="outline" onClick={() => leaveMeetup.mutate(id)} disabled={leaveMeetup.isPending}>
              Покинуть
            </Button>
          ) : (
            <Button onClick={() => joinMeetup.mutate(id)} disabled={joinMeetup.isPending}>
              <Check className="h-4 w-4 mr-2" />
              Присоединиться
            </Button>
          )}
        </div>
      </div>

      {/* Participants */}
      {participants && participants.length > 0 && (
        <div className="bg-card rounded-lg border border-border shadow-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Участники ({participants.length})</h3>
          <div className="space-y-2">
            {participants.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={p.profiles?.avatar_url} />
                  <AvatarFallback>{p.profiles?.first_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.profiles?.first_name} {p.profiles?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.profiles?.city}</p>
                </div>
                <Link to={`/profile/${p.profiles?.username || "user"}`}>
                  <Button variant="ghost" size="sm" className="text-xs">Профиль</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeetupsPage() {
  const { id } = useParams();
  if (id) return <MeetupDetail id={id} />;
  return <MeetupsList />;
}
