import { useState, useRef, useCallback, useEffect } from "react";
import { useSwipeDeck, type SwipeProfile } from "@/hooks/useSwipeDeck";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, X as XIcon, Star, User, MapPin, Sparkles, Loader2,
  ArrowLeft, Circle, CheckCircle2, MessageCircle, Zap, Crown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStartConversation } from "@/hooks/useConversations";

/* ── Match overlay ── */
function MatchScreen({ myProfile, matched, onMessage, onContinue }: {
  myProfile: any; matched: SwipeProfile; onMessage: () => void; onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="text-center max-w-sm">
        <div className="relative mb-6">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-2 animate-pulse" />
          <h2 className="text-3xl font-bold text-primary-foreground">Это совпадение!</h2>
          <p className="text-primary-foreground/70 text-[14px] mt-1">Вы понравились друг другу</p>
        </div>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary">
              <AvatarImage src={myProfile?.avatar_url || ""} />
              <AvatarFallback className="text-2xl">{myProfile?.first_name?.[0]}</AvatarFallback>
            </Avatar>
            <Heart className="absolute -bottom-1 -right-1 h-7 w-7 text-destructive fill-destructive" />
          </div>
          <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary">
              <AvatarImage src={matched.avatar_url || ""} />
              <AvatarFallback className="text-2xl">{matched.first_name[0]}</AvatarFallback>
            </Avatar>
            <Heart className="absolute -bottom-1 -right-1 h-7 w-7 text-destructive fill-destructive" />
          </div>
        </div>
        <div className="space-y-3">
          <Button size="lg" className="w-full gap-2 rounded-full text-[15px] h-12" onClick={onMessage}>
            <MessageCircle className="h-5 w-5" />Написать сообщение
          </Button>
          <Button size="lg" variant="outline" className="w-full gap-2 rounded-full text-[15px] h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20" onClick={onContinue}>
            Продолжить свайпы
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Mini profile preview ── */
function MiniProfile({ profile, onClose, myInterests }: { profile: SwipeProfile; onClose: () => void; myInterests: Set<string> }) {
  const common = profile.interests.filter(i => myInterests.has(i));
  return (
    <div className="fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="text-2xl">{profile.first_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">{profile.first_name}</h3>
              {profile.age && <span className="text-lg text-muted-foreground">{profile.age}</span>}
              {profile.is_verified && <CheckCircle2 className="h-5 w-5 text-primary fill-primary" />}
            </div>
            {profile.city && <p className="text-[13px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.city}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[13px] font-semibold text-primary">{profile.score}% совместимость</span>
              {profile.is_online && <span className="flex items-center gap-1 text-[12px] text-success"><Circle className="h-2 w-2 fill-current" />онлайн</span>}
            </div>
          </div>
        </div>
        {profile.about && <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{profile.about}</p>}
        {profile.interests.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Интересы</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map(i => (
                <span key={i} className={`text-[12px] px-2.5 py-1 rounded-full ${common.includes(i) ? "bg-primary/15 text-primary font-medium" : "bg-secondary text-muted-foreground"}`}>{i}</span>
              ))}
            </div>
          </div>
        )}
        {common.length > 0 && (
          <div className="bg-primary/5 rounded-xl p-3 mb-4">
            <p className="text-[12px] text-primary font-medium">У вас {common.length} общих {common.length === 1 ? "интерес" : "интересов"}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Link to={`/profile/${profile.username}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-full gap-1.5"><User className="h-4 w-4" />Полный профиль</Button>
          </Link>
          <Button variant="ghost" className="rounded-full" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Swipe card ── */
function SwipeCard({ profile, isCurrent, style, onSwipeStart, onSwipeMove, onSwipeEnd, onClick, myInterests }: {
  profile: SwipeProfile; isCurrent: boolean; style?: React.CSSProperties;
  onSwipeStart: (x: number, y: number) => void; onSwipeMove: (x: number, y: number) => void; onSwipeEnd: () => void;
  onClick: () => void; myInterests: Set<string>;
}) {
  const common = profile.interests.filter(i => myInterests.has(i));

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isCurrent) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onSwipeStart(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isCurrent) return;
    onSwipeMove(e.clientX, e.clientY);
  };
  const handlePointerUp = () => {
    if (!isCurrent) return;
    onSwipeEnd();
  };

  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden select-none touch-none"
      style={{ ...style, willChange: "transform" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={isCurrent ? onClick : undefined}
    >
      {/* Photo */}
      <img src={profile.avatar_url || "/placeholder.svg"} alt={profile.first_name}
        className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />

      {/* Swipe indicators */}
      <div className="swipe-like-indicator absolute top-8 left-6 bg-success/90 text-success-foreground px-5 py-2 rounded-xl text-xl font-bold border-2 border-success rotate-[-15deg] opacity-0 transition-opacity pointer-events-none"
        style={{ opacity: (style as any)?.['--like-opacity'] || 0 }}>
        НРАВИТСЯ
      </div>
      <div className="swipe-pass-indicator absolute top-8 right-6 bg-destructive/90 text-destructive-foreground px-5 py-2 rounded-xl text-xl font-bold border-2 border-destructive rotate-[15deg] opacity-0 transition-opacity pointer-events-none"
        style={{ opacity: (style as any)?.['--pass-opacity'] || 0 }}>
        ПРОПУСК
      </div>
      <div className="swipe-super-indicator absolute top-1/4 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-xl font-bold border-2 border-primary opacity-0 transition-opacity pointer-events-none"
        style={{ opacity: (style as any)?.['--super-opacity'] || 0 }}>
        ⭐ СУПЕР
      </div>

      {/* Score badge */}
      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[13px] font-bold text-foreground">{profile.score}%</span>
      </div>

      {profile.is_vip && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
          <Crown className="h-3 w-3" />VIP
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-primary-foreground">{profile.first_name}</h2>
          {profile.age && <span className="text-xl text-primary-foreground/80">{profile.age}</span>}
          {profile.is_verified && <CheckCircle2 className="h-5 w-5 text-primary fill-primary" />}
          {profile.is_online && <Circle className="h-3 w-3 fill-success text-success" />}
        </div>
        {profile.city && (
          <p className="text-[14px] text-primary-foreground/70 flex items-center gap-1 mb-2">
            <MapPin className="h-3.5 w-3.5" />{profile.city}
          </p>
        )}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {profile.interests.slice(0, 5).map(i => (
              <span key={i} className={`text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm ${common.includes(i) ? "bg-primary/40 text-primary-foreground font-semibold" : "bg-primary-foreground/15 text-primary-foreground/80"}`}>{i}</span>
            ))}
          </div>
        )}
        {profile.about && (
          <p className="text-[13px] text-primary-foreground/60 line-clamp-2">{profile.about}</p>
        )}
      </div>
    </div>
  );
}

/* ══════════ MAIN PAGE ══════════ */
export default function SwipePage() {
  const { profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const {
    currentCard, nextCard, hasMore, isLoading,
    remaining, canLike, swipeLike, swipePass,
    matchedProfile, dismissMatch, totalCards, currentIndex
  } = useSwipeDeck();

  const myInterests = new Set(myProfile?.interests || []);

  const [previewProfile, setPreviewProfile] = useState<SwipeProfile | null>(null);

  // Swipe gesture state
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const [exitAnim, setExitAnim] = useState<"left" | "right" | "up" | null>(null);

  const THRESHOLD = 100;
  const THRESHOLD_Y = -80;

  const onSwipeStart = useCallback((x: number, y: number) => {
    setDragging(true);
    setDragStart({ x, y });
    setDragDelta({ x: 0, y: 0 });
  }, []);

  const onSwipeMove = useCallback((x: number, y: number) => {
    if (!dragging) return;
    setDragDelta({ x: x - dragStart.x, y: y - dragStart.y });
  }, [dragging, dragStart]);

  const onSwipeEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (dragDelta.x > THRESHOLD) {
      setExitAnim("right");
      setTimeout(() => { setExitAnim(null); swipeLike(false); }, 250);
    } else if (dragDelta.x < -THRESHOLD) {
      setExitAnim("left");
      setTimeout(() => { setExitAnim(null); swipePass(); }, 250);
    } else if (dragDelta.y < THRESHOLD_Y) {
      setExitAnim("up");
      setTimeout(() => { setExitAnim(null); swipeLike(true); }, 250);
    } else {
      setDragDelta({ x: 0, y: 0 });
    }
  }, [dragging, dragDelta, swipeLike, swipePass]);

  const getCardStyle = (): React.CSSProperties => {
    if (exitAnim === "right") return { transform: "translateX(120%) rotate(20deg)", transition: "transform 0.25s ease-out", opacity: 0.5 };
    if (exitAnim === "left") return { transform: "translateX(-120%) rotate(-20deg)", transition: "transform 0.25s ease-out", opacity: 0.5 };
    if (exitAnim === "up") return { transform: "translateY(-120%) scale(0.8)", transition: "transform 0.25s ease-out", opacity: 0.5 };
    if (!dragging && dragDelta.x === 0 && dragDelta.y === 0) return {};
    const rotation = dragDelta.x * 0.08;
    const likeOp = Math.min(Math.max(dragDelta.x / THRESHOLD, 0), 1);
    const passOp = Math.min(Math.max(-dragDelta.x / THRESHOLD, 0), 1);
    const superOp = Math.min(Math.max(-dragDelta.y / Math.abs(THRESHOLD_Y), 0), 1);
    return {
      transform: `translate(${dragDelta.x}px, ${dragDelta.y}px) rotate(${rotation}deg)`,
      "--like-opacity": likeOp,
      "--pass-opacity": passOp,
      "--super-opacity": superOp,
    } as React.CSSProperties;
  };

  const handleMessage = async () => {
    if (!matchedProfile) return;
    try {
      const convId = await startConversation.mutateAsync(matchedProfile.user_id);
      dismissMatch();
      navigate(`/messages/${convId}`);
    } catch { dismissMatch(); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-[14px]">Загружаем анкеты…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-2">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <Link to="/discover">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[13px] rounded-full">
            <ArrowLeft className="h-4 w-4" />Discover
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-[13px] text-muted-foreground">
            {remaining === Infinity ? "∞" : remaining} свайпов
          </span>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative aspect-[3/4] max-h-[70vh] w-full rounded-3xl overflow-hidden bg-secondary">
        {!hasMore ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center">
              <Heart className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Анкеты закончились</h3>
              <p className="text-[14px] text-muted-foreground mb-4">Мы показали все доступные профили. Загляните позже!</p>
              <Link to="/discover"><Button variant="outline" className="rounded-full">Вернуться в Discover</Button></Link>
            </div>
          </div>
        ) : (
          <>
            {/* Next card (behind) */}
            {nextCard && (
              <div className="absolute inset-2 rounded-2xl overflow-hidden opacity-60 scale-95">
                <img src={nextCard.avatar_url || "/placeholder.svg"} className="w-full h-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-foreground/30" />
              </div>
            )}
            {/* Current card */}
            {currentCard && (
              <SwipeCard
                profile={currentCard}
                isCurrent
                style={getCardStyle()}
                onSwipeStart={onSwipeStart}
                onSwipeMove={onSwipeMove}
                onSwipeEnd={onSwipeEnd}
                onClick={() => setPreviewProfile(currentCard)}
                myInterests={myInterests}
              />
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      {hasMore && (
        <div className="flex items-center justify-center gap-4 py-5">
          <button
            onClick={() => { setExitAnim("left"); setTimeout(() => { setExitAnim(null); swipePass(); }, 250); }}
            className="h-14 w-14 rounded-full bg-card border-2 border-destructive/30 flex items-center justify-center shadow-lg hover:scale-110 hover:border-destructive transition-all active:scale-95"
          >
            <XIcon className="h-7 w-7 text-destructive" />
          </button>
          <button
            onClick={() => { setExitAnim("up"); setTimeout(() => { setExitAnim(null); swipeLike(true); }, 250); }}
            className="h-12 w-12 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shadow-lg hover:scale-110 hover:border-primary transition-all active:scale-95"
          >
            <Star className="h-6 w-6 text-primary" />
          </button>
          <button
            onClick={() => { setExitAnim("right"); setTimeout(() => { setExitAnim(null); swipeLike(false); }, 250); }}
            className="h-14 w-14 rounded-full bg-card border-2 border-success/30 flex items-center justify-center shadow-lg hover:scale-110 hover:border-success transition-all active:scale-95"
          >
            <Heart className="h-7 w-7 text-success" />
          </button>
          {currentCard && (
            <button
              onClick={() => setPreviewProfile(currentCard)}
              className="h-12 w-12 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95"
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {hasMore && (
        <div className="text-center pb-4">
          <p className="text-[12px] text-muted-foreground">{currentIndex + 1} из {totalCards}</p>
        </div>
      )}

      {/* Match overlay */}
      {matchedProfile && (
        <MatchScreen
          myProfile={myProfile}
          matched={matchedProfile}
          onMessage={handleMessage}
          onContinue={dismissMatch}
        />
      )}

      {/* Mini profile preview */}
      {previewProfile && (
        <MiniProfile profile={previewProfile} onClose={() => setPreviewProfile(null)} myInterests={myInterests} />
      )}
    </div>
  );
}
