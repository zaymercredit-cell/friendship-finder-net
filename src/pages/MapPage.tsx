import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Heart, MessageCircle, Locate, X, Users, CalendarDays } from "lucide-react";
import { mockUsers, currentUser, calculateMatchScore, mockEvents } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";
import { useGeoLocation, haversineDistance } from "@/hooks/useGeoLocation";
import { toast } from "sonner";

// Mock coordinates for users
function mockCoords(index: number): [number, number] {
  const baseLat = 55.7558;
  const baseLng = 37.6173;
  return [
    baseLat + Math.sin(index * 1.3) * 0.12 + Math.cos(index * 0.5) * 0.05,
    baseLng + Math.cos(index * 0.7) * 0.18 + Math.sin(index * 1.1) * 0.08,
  ];
}

interface SelectedItem {
  type: "user" | "event";
  data: any;
  coords: [number, number];
  score?: number;
  distance?: number;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { position, requestLocation } = useGeoLocation();
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  const myPos: [number, number] = position ? [position.lat, position.lng] : [55.7558, 37.6173];

  // Lazy load leaflet
  useEffect(() => {
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
    ]).then(([L, RL]) => {
      // Fix default icon
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setLeafletComponents(RL);
      setMapLoaded(true);
    });
  }, []);

  const userMarkers = useMemo(() => {
    return mockUsers
      .filter(u => u.id !== currentUser.id && u.showInDiscover !== false)
      .slice(0, 50)
      .map((u, i) => {
        const coords = mockCoords(i);
        const dist = haversineDistance(myPos[0], myPos[1], coords[0], coords[1]);
        return { user: u, coords, score: calculateMatchScore(currentUser, u), distance: dist };
      });
  }, [myPos[0], myPos[1]]);

  if (!mapLoaded || !LeafletComponents) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Карта знакомств</h1>
        <div className="bg-card rounded-lg border border-border shadow-card h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-muted-foreground">Загрузка карты...</p>
          </div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, CircleMarker } = LeafletComponents;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Карта знакомств</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{userMarkers.length} человек рядом</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={requestLocation}>
          <Locate className="h-4 w-4" />
          Моё место
        </Button>
      </div>

      <div className="relative">
        <div className="rounded-lg overflow-hidden border border-border shadow-card" style={{ height: "70vh" }}>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
          <MapContainer
            center={myPos}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* My position */}
            <CircleMarker center={myPos} radius={10} pathOptions={{ color: "hsl(217, 91%, 53%)", fillColor: "hsl(217, 91%, 53%)", fillOpacity: 0.8 }}>
              <Popup>Вы здесь</Popup>
            </CircleMarker>

            {/* User markers */}
            {userMarkers.map(({ user: u, coords, score, distance }) => (
              <CircleMarker
                key={u.id}
                center={coords}
                radius={u.isOnline ? 8 : 6}
                pathOptions={{
                  color: u.isOnline ? "hsl(142, 71%, 45%)" : "hsl(220, 9%, 46%)",
                  fillColor: u.isOnline ? "hsl(142, 71%, 45%)" : "hsl(220, 13%, 63%)",
                  fillOpacity: 0.7,
                }}
                eventHandlers={{
                  click: () => setSelected({ type: "user", data: u, coords, score, distance }),
                }}
              >
                <Popup>
                  <div className="text-center min-w-[120px]">
                    <strong>{u.name}, {u.age}</strong><br />
                    <span className="text-xs">{u.city} · {score}%</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Selected user panel */}
        {selected && selected.type === "user" && (
          <div className="absolute bottom-4 left-4 right-4 bg-card rounded-lg border border-border shadow-lg p-4 z-[1000]">
            <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selected.data.avatar} />
                <AvatarFallback>{selected.data.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{selected.data.name}, {selected.data.age}</h3>
                  <Badge variant="secondary" className="text-[10px]">{selected.score}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{selected.data.city} · {selected.distance ? `${selected.distance.toFixed(1)} км` : ""}</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => toast("❤️ Симпатия отправлена")}>
                  <Heart className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" onClick={() => navigate(`/profile/${selected.data.username}`)}>
                  Профиль
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
