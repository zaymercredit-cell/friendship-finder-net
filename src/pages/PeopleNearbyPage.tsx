import { useState, useMemo } from "react";
import { useGeoLocation, haversineDistance } from "@/hooks/useGeoLocation";
import { mockUsers, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Heart, MessageCircle, Circle, Navigation, User, Locate
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useStartConversation } from "@/hooks/useConversations";
import { toast } from "sonner";

// Generate mock coordinates near Moscow for demo
function mockCoords(index: number): { lat: number; lng: number } {
  const baseLat = 55.7558;
  const baseLng = 37.6173;
  return {
    lat: baseLat + (Math.sin(index * 1.3) * 0.15),
    lng: baseLng + (Math.cos(index * 0.7) * 0.2),
  };
}

export default function PeopleNearbyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { position, loading, requestLocation } = useGeoLocation();
  const startConversation = useStartConversation();
  const [radius, setRadius] = useState([30]);

  // Use mock position if real not available
  const myPos = position || { lat: 55.7558, lng: 37.6173 };

  const nearbyUsers = useMemo(() => {
    return mockUsers
      .filter(u => u.id !== currentUser.id && u.showInDiscover !== false)
      .map((u, i) => {
        const coords = mockCoords(i);
        const dist = haversineDistance(myPos.lat, myPos.lng, coords.lat, coords.lng);
        const score = calculateMatchScore(currentUser, u);
        return { user: u, distance: dist, score, coords };
      })
      .filter(u => u.distance <= radius[0])
      .sort((a, b) => a.distance - b.distance);
  }, [myPos.lat, myPos.lng, radius]);

  const handleLike = async (userId: string) => {
    if (user) {
      try {
        await supabase.from("likes").insert({ from_user_id: user.id, to_user_id: userId });
      } catch {}
    }
    toast("❤️ Симпатия отправлена");
  };

  const handleMessage = async (userId: string) => {
    if (!user) return toast("Войдите, чтобы написать");
    try {
      const convId = await startConversation.mutateAsync(userId);
      navigate(`/messages/${convId}`);
    } catch {
      toast.error("Не удалось начать диалог");
    }
  };

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} м`;
    return `${km.toFixed(1)} км`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Люди рядом</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Найдите интересных людей поблизости</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={requestLocation}
          disabled={loading}
        >
          <Locate className="h-4 w-4" />
          {loading ? "Определяем..." : position ? "Обновить" : "Определить"}
        </Button>
      </div>

      {/* Radius slider */}
      <div className="bg-card rounded-lg border border-border shadow-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Радиус поиска</span>
          <Badge variant="secondary">{radius[0]} км</Badge>
        </div>
        <Slider min={1} max={100} step={1} value={radius} onValueChange={setRadius} />
      </div>

      {!position && (
        <div className="bg-card rounded-lg border border-border shadow-card p-8 text-center">
          <Navigation className="h-12 w-12 text-primary/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Включите геолокацию</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Разрешите доступ к местоположению, чтобы находить людей рядом
          </p>
          <Button onClick={requestLocation} disabled={loading}>
            <Locate className="h-4 w-4 mr-2" />
            Разрешить доступ
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Пока показываем демо-данные для Москвы</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Найдено <strong className="text-foreground">{nearbyUsers.length}</strong> человек в радиусе {radius[0]} км
        </span>
      </div>

      {/* User list */}
      <div className="space-y-3">
        {nearbyUsers.slice(0, 30).map(({ user: u, distance, score }) => (
          <div
            key={u.id}
            className="bg-card rounded-lg border border-border shadow-card p-4 flex items-center gap-4 hover:shadow-elevated transition-shadow cursor-pointer"
            onClick={() => navigate(`/profile/${u.username}`)}
          >
            <div className="relative shrink-0">
              <Avatar className="h-14 w-14">
                <AvatarImage src={u.avatar} alt={u.name} />
                <AvatarFallback>{u.name[0]}</AvatarFallback>
              </Avatar>
              {u.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-card flex items-center justify-center">
                  <Circle className="h-2.5 w-2.5 fill-success text-success" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{u.name}, {u.age}</h3>
                <Badge variant="secondary" className="text-[10px] shrink-0">{score}%</Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(distance)}
                </span>
                <span>{u.city}</span>
                {u.isOnline && <span className="text-success">онлайн</span>}
              </div>
              {u.interests.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {u.interests.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
              <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleLike(u.id)}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => handleMessage(u.id)}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {nearbyUsers.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Никого рядом</h3>
          <p className="text-sm text-muted-foreground">Попробуйте увеличить радиус поиска</p>
        </div>
      )}
    </div>
  );
}
