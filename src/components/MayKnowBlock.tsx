import { useMemo } from "react";
import { mockUsers, currentUser, calculateMatchScore } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function MayKnowBlock() {
  const { profile } = useAuth();

  const mayKnow = useMemo(() => {
    // People from same city with shared interests
    return mockUsers
      .filter(u => {
        if (u.id === currentUser.id) return false;
        const sameCity = profile?.city && u.city === profile.city;
        const sharedInterests = (profile?.interests || []).filter(i => u.interests.includes(i)).length;
        return sameCity || sharedInterests >= 2;
      })
      .slice(0, 5);
  }, [profile]);

  if (mayKnow.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border/60 card-shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-[14px] font-semibold text-foreground">Возможно вы знакомы</span>
        </div>
        <Link to="/people">
          <Button variant="ghost" size="sm" className="text-[12px] text-primary h-7">Все →</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {mayKnow.map(u => (
          <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={u.avatar} alt={u.name} />
              <AvatarFallback>{u.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{u.name}</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{u.city}</span>
                {u.interests.filter(i => (profile?.interests || []).includes(i)).length > 0 && (
                  <span className="ml-1">· {u.interests.filter(i => (profile?.interests || []).includes(i)).length} общих интересов</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
