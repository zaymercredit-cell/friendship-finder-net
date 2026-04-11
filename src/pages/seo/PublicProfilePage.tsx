import { useParams, Link } from "react-router-dom";
import { mockUsers } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Target, Loader2 } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function PublicProfilePage() {
  const { username } = useParams();

  const { data: dbProfile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, avatar_url, age, city, interests, communication_goals, about, gender, is_online")
        .eq("username", username!)
        .single();
      return data;
    },
    enabled: !!username,
  });

  const mockUser = !dbProfile ? mockUsers.find(u => u.username === username) : null;

  const name = dbProfile ? `${dbProfile.first_name} ${dbProfile.last_name}`.trim() : mockUser?.name || "";
  const avatar = dbProfile?.avatar_url || mockUser?.avatar || "";
  const age = dbProfile?.age || mockUser?.age;
  const city = dbProfile?.city || mockUser?.city || "";
  const interests = dbProfile?.interests || mockUser?.interests || [];
  const goals = dbProfile?.communication_goals || mockUser?.communicationGoals || [];
  const about = dbProfile?.about || mockUser?.about || "";
  const found = !!dbProfile || !!mockUser;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!found) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Профиль не найден</p>
          <Link to="/"><Button variant="outline" className="mt-4">На главную</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`${name}${age ? `, ${age}` : ""} — профиль на ВДрузьях`}
        description={`${name} из ${city}. ${about ? about.slice(0, 120) : "Профиль на ВДрузьях — социальной сети знакомств."}`}
        canonical={`https://mutual-connections.lovable.app/u/${username}`}
        ogType="profile"
      />

      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">В</span>
            </div>
            <span className="text-lg font-bold text-foreground">ВДрузьях</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/auth/login"><Button variant="ghost" size="sm">Войти</Button></Link>
            <Link to="/auth/register"><Button size="sm">Регистрация</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <Avatar className="h-28 w-28 mx-auto mb-4">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-foreground">{name}{age ? `, ${age}` : ""}</h1>
          {city && (
            <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />{city}
            </p>
          )}
          {about && <p className="text-muted-foreground mt-3 max-w-md mx-auto">{about}</p>}

          {interests.length > 0 && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Интересы</h2>
              <div className="flex flex-wrap justify-center gap-1.5">
                {interests.map(i => <Badge key={i} variant="secondary">{i}</Badge>)}
              </div>
            </div>
          )}

          {goals.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center justify-center gap-1.5">
                <Target className="h-4 w-4 text-primary" /> Цели
              </h2>
              <div className="flex flex-wrap justify-center gap-1.5">
                {goals.map(g => <Badge key={g} variant="outline">{g}</Badge>)}
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Хотите познакомиться?</p>
            <div className="flex justify-center gap-3">
              <Link to="/auth/register">
                <Button className="gap-1.5"><Heart className="h-4 w-4" />Создать анкету</Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline">Войти</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
