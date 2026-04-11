import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Heart, UsersRound, CalendarDays, Sparkles, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── types ─── */
interface GNode {
  id: string;
  type: "user" | "interest" | "community" | "event";
  label: string;
  avatar?: string | null;
  extra?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  isOnline?: boolean;
  compatibility?: number;
  membersCount?: number;
  date?: string;
  city?: string;
  username?: string;
}

interface GEdge {
  source: string;
  target: string;
  type: "friend" | "interest" | "community" | "event";
}

/* ─── palette ─── */
const NODE_COLORS: Record<string, string> = {
  user: "hsl(262 80% 60%)",
  interest: "hsl(330 80% 60%)",
  community: "hsl(200 80% 55%)",
  event: "hsl(40 90% 55%)",
};

const EDGE_COLORS: Record<string, string> = {
  friend: "hsla(262,60%,60%,0.25)",
  interest: "hsla(330,60%,60%,0.18)",
  community: "hsla(200,60%,60%,0.18)",
  event: "hsla(40,70%,55%,0.18)",
};

/* ─── force helpers ─── */
function dist(a: GNode, b: GNode) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function buildAdjMap(edges: GEdge[]) {
  const m = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!m.has(e.source)) m.set(e.source, new Set());
    if (!m.has(e.target)) m.set(e.target, new Set());
    m.get(e.source)!.add(e.target);
    m.get(e.target)!.add(e.source);
  }
  return m;
}

/* ─── component ─── */
export default function SocialGraphPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<GNode[]>([]);
  const edgesRef = useRef<GEdge[]>([]);
  const adjRef = useRef<Map<string, Set<string>>>(new Map());
  const frameRef = useRef(0);
  const [hoveredNode, setHoveredNode] = useState<GNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<string[]>(["user", "interest", "community", "event"]);
  const [viewMode, setViewMode] = useState("my");
  const [zoom, setZoom] = useState(1);
  const panRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef<{ node: GNode | null; isPan: boolean; startX: number; startY: number }>({ node: null, isPan: false, startX: 0, startY: 0 });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);

  /* ─── fetch data ─── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const myId = user.id;

      // profiles
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name, last_name, avatar_url, is_online, interests, city, username").limit(120);
      // communities
      const { data: comms } = await supabase.from("communities").select("id, name, members_count, cover_url").limit(40);
      // meetups as events
      const { data: meetups } = await supabase.from("meetups").select("id, title, city, start_time").limit(30);
      // matches
      const { data: matches } = await supabase.from("matches").select("user1_id, user2_id").or(`user1_id.eq.${myId},user2_id.eq.${myId}`).limit(200);
      // community members
      const { data: cmembers } = await supabase.from("community_members").select("user_id, community_id").limit(500);
      // meetup participants
      const { data: mparts } = await supabase.from("meetup_participants").select("user_id, meetup_id").limit(300);

      const nodes: GNode[] = [];
      const edges: GEdge[] = [];
      const W = 1200, H = 900;

      const rnd = () => Math.random();
      const cx = W / 2, cy = H / 2;

      // users
      const profileMap = new Map<string, typeof profiles extends (infer T)[] | null ? T : never>();
      (profiles || []).forEach(p => {
        profileMap.set(p.user_id, p);
        const isMe = p.user_id === myId;
        nodes.push({
          id: p.user_id, type: "user", label: `${p.first_name} ${p.last_name}`.trim() || "User",
          avatar: p.avatar_url, x: isMe ? cx : cx + (rnd() - 0.5) * 600, y: isMe ? cy : cy + (rnd() - 0.5) * 500,
          vx: 0, vy: 0, r: isMe ? 28 : 16, color: NODE_COLORS.user,
          isOnline: p.is_online ?? false, username: p.username ?? undefined, city: p.city ?? undefined,
        });
      });

      // interests
      const interestSet = new Set<string>();
      (profiles || []).forEach(p => (p.interests || []).forEach((i: string) => interestSet.add(i)));
      const interestArr = [...interestSet].slice(0, 50);
      interestArr.forEach((name, i) => {
        const angle = (i / interestArr.length) * Math.PI * 2;
        nodes.push({
          id: `int_${name}`, type: "interest", label: name,
          x: cx + Math.cos(angle) * 350 + (rnd() - 0.5) * 60, y: cy + Math.sin(angle) * 280 + (rnd() - 0.5) * 60,
          vx: 0, vy: 0, r: 12, color: NODE_COLORS.interest,
        });
      });

      // link users to interests
      (profiles || []).forEach(p => {
        (p.interests || []).forEach((interest: string) => {
          if (interestSet.has(interest)) {
            edges.push({ source: p.user_id, target: `int_${interest}`, type: "interest" });
          }
        });
      });

      // communities
      (comms || []).forEach((c, i) => {
        const angle = (i / (comms?.length || 1)) * Math.PI * 2;
        nodes.push({
          id: `com_${c.id}`, type: "community", label: c.name,
          x: cx + Math.cos(angle) * 420 + (rnd() - 0.5) * 40, y: cy + Math.sin(angle) * 340 + (rnd() - 0.5) * 40,
          vx: 0, vy: 0, r: 20, color: NODE_COLORS.community, membersCount: c.members_count,
        });
      });

      // community memberships
      (cmembers || []).forEach(cm => {
        if (profileMap.has(cm.user_id)) {
          edges.push({ source: cm.user_id, target: `com_${cm.community_id}`, type: "community" });
        }
      });

      // events
      (meetups || []).forEach((ev, i) => {
        const angle = (i / (meetups?.length || 1)) * Math.PI * 2;
        nodes.push({
          id: `evt_${ev.id}`, type: "event", label: ev.title,
          x: cx + Math.cos(angle) * 460 + (rnd() - 0.5) * 40, y: cy + Math.sin(angle) * 380 + (rnd() - 0.5) * 40,
          vx: 0, vy: 0, r: 14, color: NODE_COLORS.event, date: ev.start_time, city: ev.city ?? undefined,
        });
      });

      // event participations
      (mparts || []).forEach(mp => {
        if (profileMap.has(mp.user_id)) {
          edges.push({ source: mp.user_id, target: `evt_${mp.meetup_id}`, type: "event" });
        }
      });

      // friend edges from matches
      (matches || []).forEach(m => {
        edges.push({ source: m.user1_id, target: m.user2_id, type: "friend" });
      });

      nodesRef.current = nodes;
      edgesRef.current = edges;
      adjRef.current = buildAdjMap(edges);

      // center on me
      const me = nodes.find(n => n.id === myId);
      if (me) {
        panRef.current = { x: -(me.x - W / 2), y: -(me.y - H / 2) };
      }

      // AI insights
      const myInterests = profile?.interests || [];
      const friendIds = new Set((matches || []).map(m => m.user1_id === myId ? m.user2_id : m.user1_id));
      const myComms = (cmembers || []).filter(c => c.user_id === myId).map(c => c.community_id);
      const insights: string[] = [];
      if (myComms.length > 0) {
        const commName = (comms || []).find(c => c.id === myComms[0])?.name;
        if (commName) insights.push(`У вас много связей через сообщество «${commName}»`);
      }
      if (myInterests.length > 0) {
        insights.push(`Интерес «${myInterests[0]}» связывает вас с ${(profiles || []).filter(p => p.user_id !== myId && (p.interests || []).includes(myInterests[0])).length} людьми`);
      }
      insights.push(`Вы можете познакомиться с ${Math.max(0, (profiles || []).length - friendIds.size - 1)} новыми людьми на платформе`);
      setInsights(insights);

      setLoading(false);
    })();
  }, [user, profile]);

  /* ─── force simulation ─── */
  useEffect(() => {
    if (loading) return;
    let running = true;
    const W = containerRef.current?.clientWidth || 1200;
    const H = containerRef.current?.clientHeight || 800;

    const step = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const alpha = 0.15;

      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.max(dist(a, b), 1);
          const force = 800 / (d * d);
          const fx = (dx / d) * force, fy = (dy / d) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // attraction for edges
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      for (const e of edges) {
        const a = nodeMap.get(e.source), b = nodeMap.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.max(dist(a, b), 1);
        const ideal = 120;
        const force = (d - ideal) * 0.003;
        const fx = (dx / d) * force, fy = (dy / d) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // center gravity
      const cx = W / 2, cy = H / 2;
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.0003;
        n.vy += (cy - n.y) * 0.0003;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx * alpha;
        n.y += n.vy * alpha;
      }
    };

    const draw = () => {
      if (!running) return;
      step();
      const canvas = canvasRef.current;
      if (!canvas) { frameRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(panRef.current.x + cw / 2, panRef.current.y + ch / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-cw / 2, -ch / 2);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      const visTypes = new Set(filter);

      // edges
      for (const e of edges) {
        const a = nodeMap.get(e.source), b = nodeMap.get(e.target);
        if (!a || !b) continue;
        if (!visTypes.has(a.type) || !visTypes.has(b.type)) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = EDGE_COLORS[e.type] || "hsla(0,0%,50%,0.1)";
        ctx.lineWidth = e.type === "friend" ? 1.5 : 0.8;
        ctx.stroke();
      }

      // nodes
      for (const n of nodes) {
        if (!visTypes.has(n.type)) continue;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

        if (n.type === "user") {
          const grad = ctx.createRadialGradient(n.x, n.y, n.r * 0.3, n.x, n.y, n.r);
          grad.addColorStop(0, "hsl(262 80% 75%)");
          grad.addColorStop(1, n.color);
          ctx.fillStyle = grad;
        } else if (n.type === "interest") {
          ctx.fillStyle = "hsl(330 75% 65%)";
        } else if (n.type === "community") {
          ctx.fillStyle = "hsl(200 75% 60%)";
        } else {
          ctx.fillStyle = "hsl(40 85% 58%)";
        }
        ctx.fill();

        // online ring
        if (n.type === "user" && n.isOnline) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = "hsl(145 70% 50%)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // label
        ctx.fillStyle = "hsl(0 0% 95%)";
        ctx.font = n.type === "user" ? "bold 9px sans-serif" : "8px sans-serif";
        ctx.textAlign = "center";
        const label = n.label.length > 14 ? n.label.slice(0, 13) + "…" : n.label;
        ctx.fillText(label, n.x, n.y + n.r + 12);
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, [loading, filter, zoom]);

  /* ─── interaction ─── */
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: sx, y: sy };
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
    const wx = (sx - rect.left - panRef.current.x - cx) / zoom + cx;
    const wy = (sy - rect.top - panRef.current.y - cy) / zoom + cy;
    return { x: wx, y: wy };
  }, [zoom]);

  const findNodeAt = useCallback((wx: number, wy: number) => {
    const visTypes = new Set(filter);
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const n = nodesRef.current[i];
      if (!visTypes.has(n.type)) continue;
      if (Math.hypot(n.x - wx, n.y - wy) < n.r + 4) return n;
    }
    return null;
  }, [filter]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const d = draggingRef.current;
    if (d.isPan) {
      panRef.current.x += e.clientX - d.startX;
      panRef.current.y += e.clientY - d.startY;
      d.startX = e.clientX; d.startY = e.clientY;
      return;
    }
    if (d.node) {
      d.node.x = x; d.node.y = y;
      d.node.vx = 0; d.node.vy = 0;
      return;
    }
    const node = findNodeAt(x, y);
    setHoveredNode(node);
    if (node) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  }, [screenToWorld, findNodeAt]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const node = findNodeAt(x, y);
    if (node) {
      draggingRef.current = { node, isPan: false, startX: e.clientX, startY: e.clientY };
    } else {
      draggingRef.current = { node: null, isPan: true, startX: e.clientX, startY: e.clientY };
    }
  }, [screenToWorld, findNodeAt]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = { node: null, isPan: false, startX: 0, startY: 0 };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const node = findNodeAt(x, y);
    if (node) setSelectedNode(node);
  }, [screenToWorld, findNodeAt]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.08 : 0.08))));
  }, []);

  const resetView = () => { setZoom(1); panRef.current = { x: 0, y: 0 }; };

  /* ─── touch ─── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const { x, y } = screenToWorld(t.clientX, t.clientY);
      const node = findNodeAt(x, y);
      if (node) {
        draggingRef.current = { node, isPan: false, startX: t.clientX, startY: t.clientY };
      } else {
        draggingRef.current = { node: null, isPan: true, startX: t.clientX, startY: t.clientY };
      }
    }
  }, [screenToWorld, findNodeAt]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const d = draggingRef.current;
      if (d.isPan) {
        panRef.current.x += t.clientX - d.startX;
        panRef.current.y += t.clientY - d.startY;
        d.startX = t.clientX; d.startY = t.clientY;
      } else if (d.node) {
        const { x, y } = screenToWorld(t.clientX, t.clientY);
        d.node.x = x; d.node.y = y;
        d.node.vx = 0; d.node.vy = 0;
      }
    }
  }, [screenToWorld]);

  const handleTouchEnd = useCallback(() => {
    draggingRef.current = { node: null, isPan: false, startX: 0, startY: 0 };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm z-10">
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Карта знакомств
        </h1>
        <div className="flex items-center gap-1.5">
          <ToggleGroup type="multiple" value={filter} onValueChange={v => setFilter(v.length ? v : filter)} size="sm" className="gap-0.5">
            <ToggleGroupItem value="user" className="text-xs px-2 h-7"><Users className="h-3 w-3 mr-1" />Люди</ToggleGroupItem>
            <ToggleGroupItem value="interest" className="text-xs px-2 h-7"><Heart className="h-3 w-3 mr-1" />Интересы</ToggleGroupItem>
            <ToggleGroupItem value="community" className="text-xs px-2 h-7"><UsersRound className="h-3 w-3 mr-1" />Группы</ToggleGroupItem>
            <ToggleGroupItem value="event" className="text-xs px-2 h-7"><CalendarDays className="h-3 w-3 mr-1" />События</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-background">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Sparkles className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={() => setZoom(z => Math.min(3, z + 0.2))}><ZoomIn className="h-4 w-4" /></Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}><ZoomOut className="h-4 w-4" /></Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={resetView}><RotateCcw className="h-4 w-4" /></Button>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="absolute top-3 left-3 max-w-xs space-y-1.5 z-10">
            {insights.map((text, i) => (
              <div key={i} className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground shadow-lg flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredNode && !draggingRef.current.node && (
          <div
            className="fixed z-50 pointer-events-none bg-card border border-border/60 rounded-xl shadow-xl px-3 py-2.5 min-w-[180px]"
            style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 10 }}
          >
            <div className="flex items-center gap-2.5">
              {hoveredNode.type === "user" && (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={hoveredNode.avatar ?? undefined} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">{hoveredNode.label[0]}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{hoveredNode.label}</p>
                <Badge variant="outline" className="text-[10px] mt-0.5">
                  {hoveredNode.type === "user" ? (hoveredNode.isOnline ? "Онлайн" : "Пользователь") :
                   hoveredNode.type === "interest" ? "Интерес" :
                   hoveredNode.type === "community" ? `${hoveredNode.membersCount ?? 0} участников` :
                   hoveredNode.date ? new Date(hoveredNode.date).toLocaleDateString("ru") : "Событие"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Selected node panel */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 z-20 bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-2xl p-4 w-72 animate-scale-in">
            <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setSelectedNode(null)}><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-3">
              {selectedNode.type === "user" ? (
                <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                  <AvatarImage src={selectedNode.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">{selectedNode.label[0]}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: selectedNode.color, color: "#fff" }}>
                  {selectedNode.type === "interest" ? "♡" : selectedNode.type === "community" ? "☷" : "★"}
                </div>
              )}
              <div>
                <p className="font-bold text-foreground">{selectedNode.label}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedNode.type === "user" ? (selectedNode.city || "Пользователь") :
                   selectedNode.type === "interest" ? "Интерес" :
                   selectedNode.type === "community" ? `${selectedNode.membersCount ?? 0} участников` :
                   selectedNode.city || "Событие"}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {adjRef.current.get(selectedNode.id)?.size ?? 0} связей на карте
            </div>
            {selectedNode.type === "user" && selectedNode.username && (
              <Button size="sm" className="w-full" onClick={() => navigate(`/profile/${selectedNode.username}`)}>
                Открыть профиль
              </Button>
            )}
            {selectedNode.type === "community" && (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("/communities")}>
                Перейти в сообщества
              </Button>
            )}
            {selectedNode.type === "event" && (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("/meetups")}>
                Перейти к событиям
              </Button>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm border border-border/40 rounded-lg px-3 py-2 z-10 hidden md:block">
          <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: NODE_COLORS.user }} /> Люди</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: NODE_COLORS.interest }} /> Интересы</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: NODE_COLORS.community }} /> Сообщества</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: NODE_COLORS.event }} /> События</div>
          </div>
        </div>
      </div>
    </div>
  );
}
