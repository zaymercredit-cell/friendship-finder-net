import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRecordProfileView } from "@/hooks/useProfileViews";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Settings, Camera, Users, FileText, Image as ImageIcon,
  Heart, Circle, Loader2, MessageCircle, UserPlus, Calendar, Target,
  MoreHorizontal, Flag, Ban, LinkIcon, EyeOff, Briefcase, GraduationCap,
  Film, Music, BookOpen, MapPinned, Coffee, Sparkles, TrendingUp, CheckCircle2,
  Star, Activity, Share2, Flame, Zap, Globe, Eye
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useStartConversation } from "@/hooks/useConversations";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUploadButton from "@/components/ImageUploadButton";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";
import PhotoGalleryLightbox from "@/components/PhotoGalleryLightbox";
import { mockPosts, mockUsers, mockCommunities, currentUser as mockCurrentUser, type User as MockUser } from "@/lib/mock-data";
import PostCard from "@/components/PostCard";
import AiCompatibilityCard from "@/components/ai/AiCompatibilityCard";
import PersonalityTestCard from "@/components/ai/PersonalityTestCard";
import AiProfileTips from "@/components/ai/AiProfileTips";
import AiFirstMessageCard from "@/components/ai/AiFirstMessageCard";
import AiIcebreakerCard from "@/components/ai/AiIcebreakerCard";
import AiProfileScoreCard from "@/components/ai/AiProfileScoreCard";
import AiProfileHighlightsCard from "@/components/ai/AiProfileHighlightsCard";
import AiAvatarChat from "@/components/ai/AiAvatarChat";
import PersonalityCompatibilityCard from "@/components/ai/PersonalityCompatibilityCard";
import PersonalityBadge from "@/components/ai/PersonalityBadge";
import AiCoachCard from "@/components/ai/AiCoachCard";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ReportDialog from "@/components/ReportDialog";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import { useBlockUser, useIsBlocked } from "@/hooks/useBlocks";
import { useTrustScore } from "@/hooks/useTrustScore";
import ProfileSafetyBlock from "@/components/trust/ProfileSafetyBlock";
import VerificationBanner from "@/components/trust/VerificationBanner";
import SafeMeetingTips from "@/components/trust/SafeMeetingTips";
import PersonalityBlock from "@/components/profile/PersonalityBlock";
import LifeValuesBlock from "@/components/profile/LifeValuesBlock";
import LifestyleBlock from "@/components/profile/LifestyleBlock";
import DatingStyleBlock from "@/components/profile/DatingStyleBlock";
import AiWingmanCard from "@/components/ai/AiWingmanCard";
import AiDateIdeasCard from "@/components/ai/AiDateIdeasCard";
import AiProfileInsights from "@/components/profile/AiProfileInsights";

/* ── helpers ── */

function OnlineIndicator({ isOnline, lastSeen, size = "md" }: { isOnline: boolean; lastSeen?: string; size?: "sm" | "md" }) {
  if (isOnline) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium text-green-500 ${size === "sm" ? "text-[11px]" : "text-[13px]"}`}>
        <span className="h-2 w-2 rounded-full bg-green-500" />онлайн
      </span>
    );
  }
  return <span className={`text-muted-foreground ${size === "sm" ? "text-[11px]" : "text-[13px]"}`}>{lastSeen || "был(а) недавно"}</span>;
}

function StorySection({ icon: Icon, title, children, className = "", accent = false }: {
  icon?: any; title: string; children: React.ReactNode; className?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border/40 p-5 md:p-6 ${accent ? "bg-card" : "bg-card"} ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        {Icon && (
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-4 py-2">
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function CompletionBar({ profile }: { profile: any }) {
  const items = [
    { done: !!profile.avatar, label: "Добавить фото" },
    { done: !!profile.about && profile.about.length > 10, label: "Написать о себе" },
    { done: profile.interests.length >= 3, label: "Указать интересы" },
    { done: !!profile.city, label: "Указать город" },
    { done: !!profile.work || !!profile.education, label: "Работа / образование" },
    { done: !!profile.idealDate, label: "Идеальное свидание" },
  ];
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const todo = items.filter(i => !i.done);
  if (pct === 100) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl border border-primary/10 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[14px] font-semibold text-foreground">Профиль заполнен</span>
        <span className="text-[14px] font-bold text-primary">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2 mb-3" />
      <div className="flex flex-wrap gap-2">
        {todo.map(t => (
          <span key={t.label} className="text-[12px] bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">+ {t.label}</span>
        ))}
      </div>
    </div>
  );
}

function CompatibilityHero({ myProfile, targetProfile }: { myProfile: any; targetProfile: any }) {
  const myInterests = new Set(myProfile?.interests || []);
  const theirInterests = targetProfile.interests || [];
  const common = theirInterests.filter((i: string) => myInterests.has(i));
  const myGoals = new Set(myProfile?.communication_goals || []);
  const theirGoals = targetProfile.communicationGoals || [];
  const commonGoals = theirGoals.filter((g: string) => myGoals.has(g));
  let score = 40;
  score += Math.min(common.length * 8, 30);
  score += Math.min(commonGoals.length * 10, 20);
  if (myProfile?.city && targetProfile.city && myProfile.city === targetProfile.city) score += 10;
  score = Math.min(score, 99);
  const color = score >= 75 ? "text-green-500" : score >= 50 ? "text-primary" : "text-muted-foreground";
  const ringColor = score >= 75 ? "border-green-500/30" : score >= 50 ? "border-primary/30" : "border-border";

  return (
    <div className={`rounded-2xl border-2 ${ringColor} p-5 bg-gradient-to-r from-primary/[0.04] via-card to-green-500/[0.03]`}>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
              strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${color}`}>{score}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-foreground">
            {score >= 75 ? "Отличная совместимость!" : score >= 50 ? "Хорошая совместимость" : "Есть общие точки"}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {common.length > 0 && `${common.length} общих интересов`}
            {common.length > 0 && commonGoals.length > 0 && " • "}
            {commonGoals.length > 0 && `${commonGoals.length} общих целей`}
            {common.length === 0 && commonGoals.length === 0 && "Узнайте друг друга лучше"}
          </p>
          {common.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {common.slice(0, 5).map((i: string) => (
                <span key={i} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{i}</span>
              ))}
              {common.length > 5 && <span className="text-[11px] text-muted-foreground">+{common.length - 5}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Unified profile shape ── */
interface DisplayProfile {
  name: string; username: string; avatar: string; cover: string;
  age?: number; city?: string; gender?: string; isOnline: boolean; lastSeen?: string;
  about?: string; statusText?: string; interests: string[]; communicationGoals: string[];
  lookingForGender?: string; readyForMeetings?: boolean; readyForChat?: boolean;
  friendsCount: number; postsCount: number; communitiesCount: number; createdAt?: string;
  work?: string; education?: string; idealDate?: string;
  favoriteMovies: string[]; favoriteMusic: string[]; favoriteBooks: string[]; favoritePlaces: string[];
  temperament?: string; communicationStyle?: string; lifeValues: string[]; lifestyle: string[];
  isMock: boolean; mockUser?: MockUser;
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, profile: myProfile, refreshProfile } = useAuth();
  const isOwnProfile = !username || username === "me" || username === myProfile?.username;
  const startConversation = useStartConversation();
  const recordView = useRecordProfileView();

  const { data: dbProfile, isLoading } = useQuery({
    queryKey: ["profile", isOwnProfile ? myProfile?.user_id : username],
    queryFn: async () => {
      if (isOwnProfile && myProfile) return myProfile;
      const { data } = await supabase.from("profiles").select("*").eq("username", username!).single();
      return data;
    },
    enabled: isOwnProfile ? !!myProfile : !!username,
  });

  useEffect(() => {
    if (!isOwnProfile && dbProfile?.user_id) recordView.mutate(dbProfile.user_id);
  }, [isOwnProfile, dbProfile?.user_id]);

  const mockUser = useMemo(() => {
    if (dbProfile || isOwnProfile) return null;
    return mockUsers.find(u => u.username === username) || null;
  }, [dbProfile, isOwnProfile, username]);

  const dp: DisplayProfile | null = useMemo(() => {
    if (dbProfile) {
      const p = dbProfile as any;
      return {
        name: `${p.first_name} ${p.last_name}`.trim() || "Пользователь",
        username: p.username || "user", avatar: p.avatar_url || "", cover: p.cover_url || "",
        age: p.age ?? undefined, city: p.city || undefined, gender: p.gender || undefined,
        isOnline: p.is_online || false, about: p.about || undefined, statusText: p.status_text || undefined,
        interests: p.interests || [], communicationGoals: p.communication_goals || [],
        lookingForGender: p.looking_for_gender || undefined,
        readyForMeetings: p.ready_for_meetings ?? false, readyForChat: p.ready_for_chat ?? true,
        friendsCount: 47, postsCount: mockPosts.length, communitiesCount: 5,
        createdAt: p.created_at, work: p.work || undefined, education: p.education || undefined,
        idealDate: p.ideal_date || undefined,
        favoriteMovies: p.favorite_movies || [], favoriteMusic: p.favorite_music || [],
        favoriteBooks: p.favorite_books || [], favoritePlaces: p.favorite_places || [],
        temperament: p.temperament || undefined, communicationStyle: p.communication_style || undefined,
        lifeValues: p.life_values || [], lifestyle: p.lifestyle || [],
        isMock: false,
      };
    }
    if (mockUser) {
      return {
        name: mockUser.name, username: mockUser.username, avatar: mockUser.avatar, cover: "",
        age: mockUser.age, city: mockUser.city, gender: mockUser.gender,
        isOnline: mockUser.isOnline, lastSeen: mockUser.lastSeen, about: mockUser.about,
        interests: mockUser.interests, communicationGoals: mockUser.communicationGoals || [],
        lookingForGender: mockUser.lookingForGender, readyForMeetings: mockUser.readyForMeetings,
        readyForChat: mockUser.readyForChat, friendsCount: mockUser.friendsCount,
        postsCount: mockUser.postsCount, communitiesCount: mockUser.communitiesCount,
        isMock: true, mockUser, work: "", education: "", idealDate: "", statusText: "",
        favoriteMovies: [], favoriteMusic: [], favoriteBooks: [], favoritePlaces: [],
        temperament: undefined, communicationStyle: undefined, lifeValues: [], lifestyle: [],
      };
    }
    return null;
  }, [dbProfile, mockUser]);

  const avatarUpload = useImageUpload({
    bucket: "avatars", maxSize: 5 * 1024 * 1024,
    onSuccess: async (url) => { if (!user) return; await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id); refreshProfile(); },
  });
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const coverUpload = useImageUpload({
    bucket: "profile-covers", maxSize: 10 * 1024 * 1024,
    onSuccess: async (url) => { if (!user) return; await supabase.from("profiles").update({ cover_url: url }).eq("user_id", user.id); refreshProfile(); },
  });
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const blockUser = useBlockUser();
  const isBlocked = useIsBlocked(dbProfile?.user_id);
  const trustScore = useTrustScore(dbProfile ? {
    avatarUrl: dbProfile.avatar_url, about: dbProfile.about, interests: dbProfile.interests,
    isVerified: (dbProfile as any).is_verified, isVip: dbProfile.is_vip, createdAt: dbProfile.created_at,
    city: dbProfile.city, age: dbProfile.age,
  } : null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryImages = mockPosts.filter(p => p.images).flatMap(p => p.images!);

  const userPosts = useMemo(() => {
    if (dp?.isMock && dp.mockUser) return mockPosts.filter(p => p.author.id === dp.mockUser!.id).slice(0, 10);
    return mockPosts.slice(0, 5);
  }, [dp]);

  const userFriends = useMemo(() => mockUsers.slice(0, 12), []);

  if (isLoading && !mockUser) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!dp) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-muted-foreground text-[15px]">Профиль не найден</p>
        <Link to="/discover"><Button variant="outline" size="sm" className="mt-4">Вернуться</Button></Link>
      </div>
    );
  }

  const lookingForLabel = dp.lookingForGender === "male" ? "Мужчин" : dp.lookingForGender === "female" ? "Женщин" : "Не указано";
  const hasLifestyle = dp.work || dp.education;
  const hasFavorites = dp.favoriteMovies.length > 0 || dp.favoriteMusic.length > 0 || dp.favoriteBooks.length > 0 || dp.favoritePlaces.length > 0;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* ═══════════ HERO ═══════════ */}
      <div className="relative rounded-2xl overflow-hidden card-shadow">
        {/* Cover — taller, more immersive */}
        <div className="h-64 md:h-80 bg-cover bg-center relative" style={dp.cover ? { backgroundImage: `url(${dp.cover})` } : undefined}>
          {!dp.cover && <div className="absolute inset-0 bg-[var(--gradient-hero)]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          {isOwnProfile && (
            <ImageUploadButton onFileSelect={(f) => { coverUpload.selectFile(f); setCoverDialogOpen(true); }}
              className="absolute top-4 right-4 text-[12px] gap-1.5 bg-card/80 hover:bg-card border border-border/40 rounded-full text-foreground" variant="ghost" size="sm">
              <Camera className="h-3.5 w-3.5" />Обложка
            </ImageUploadButton>
          )}
        </div>

        {/* Profile overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 md:px-8 pb-6">
          <div className="flex items-end gap-5">
            {/* Avatar — large, premium ring */}
            <div className="relative group shrink-0">
              <div className="ring-[5px] ring-card rounded-full card-shadow">
                <Avatar className="h-32 w-32 md:h-36 md:w-36 border-2 border-primary/20">
                  <AvatarImage src={dp.avatar} alt={dp.name} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-secondary text-foreground">{dp.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              {dp.isOnline && (
                <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-[3px] border-card shadow-sm" />
              )}
              {isOwnProfile && (
                <ImageUploadButton onFileSelect={(f) => { avatarUpload.selectFile(f); setAvatarDialogOpen(true); }}
                  className="absolute inset-0 rounded-full bg-foreground/0 hover:bg-foreground/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100" variant="ghost" size="icon">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                </ImageUploadButton>
              )}
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight">{dp.name}</h1>
                {dp.age && <span className="text-xl font-light text-foreground/60">{dp.age}</span>}
                {dbProfile?.user_id && <PersonalityBadge userId={dbProfile.user_id} />}
                {(dbProfile as any)?.is_verified && (
                  <CheckCircle2 className="h-5 w-5 fill-primary text-primary-foreground" />
                )}
                {(dbProfile as any)?.is_vip && (
                  <span className="inline-flex items-center rounded-full font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white h-5 px-2 text-[10px] gap-0.5 shadow-sm">
                    <Star className="h-2.5 w-2.5" />VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[13px] text-foreground/50">@{dp.username}</span>
                {dp.city && <span className="flex items-center gap-1 text-[13px] text-foreground/50"><MapPin className="h-3 w-3" />{dp.city}</span>}
                <OnlineIndicator isOnline={dp.isOnline} lastSeen={dp.lastSeen} />
              </div>
              {dp.statusText && (
                <p className="text-[13px] text-foreground/60 mt-2 italic bg-secondary/40 rounded-lg px-3 py-1.5 inline-block">"{dp.statusText}"</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ STATS + ACTIONS ═══════════ */}
      <div className="bg-card rounded-2xl border border-border/40 mt-3 shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center divide-x divide-border">
            <StatPill label="постов" value={dp.postsCount} />
            <StatPill label="друзей" value={dp.friendsCount} />
            <StatPill label="фото" value={galleryImages.length} />
            {!isOwnProfile && trustScore > 0 && (
              <div className="px-4"><TrustScoreBadge score={trustScore} /></div>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {isOwnProfile ? (
              <Link to="/settings">
                <Button size="sm" variant="secondary" className="gap-1.5 text-[13px] h-9 rounded-full"><Settings className="h-4 w-4" />Редактировать</Button>
              </Link>
            ) : (
              <>
                <Button size="sm" className="gap-1.5 text-[13px] h-10 rounded-full shadow-sm px-5 font-semibold" onClick={() => toast("❤️ Симпатия отправлена")}>
                  <Heart className="h-4 w-4" />Симпатия
                </Button>
                <Button size="sm" variant="secondary" className="gap-1.5 text-[13px] h-10 rounded-full px-4" onClick={async () => {
                  if (!dbProfile?.user_id) { toast("Скоро"); return; }
                  try { const convId = await startConversation.mutateAsync(dbProfile.user_id); navigate(`/messages/${convId}`); } catch { toast.error("Ошибка"); }
                }}>
                  <MessageCircle className="h-4 w-4" />Написать
                </Button>
                <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-full" onClick={() => toast("Заявка отправлена")}>
                  <UserPlus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(window.location.href); toast("Ссылка скопирована"); }}>
                      <LinkIcon className="h-4 w-4 mr-2" />Скопировать ссылку
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-muted-foreground"><EyeOff className="h-4 w-4 mr-2" />Скрыть</DropdownMenuItem>
                    <DropdownMenuItem className="text-muted-foreground" onClick={() => setReportOpen(true)}><Flag className="h-4 w-4 mr-2" />Пожаловаться</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => dbProfile?.user_id && blockUser.mutate(dbProfile.user_id)}>
                      <Ban className="h-4 w-4 mr-2" />{isBlocked ? "Разблокировать" : "Заблокировать"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ STORY SECTIONS ═══════════ */}
      <div className="space-y-3 mt-4">

        {isOwnProfile && dp && <CompletionBar profile={dp} />}
        {isOwnProfile && <AiProfileHighlightsCard />}

        {/* Compatibility — prominent for other profiles */}
        {!isOwnProfile && myProfile && dp && <CompatibilityHero myProfile={myProfile} targetProfile={dp} />}

        {/* About — the most important text block */}
        {(dp.about || isOwnProfile) && (
          <StorySection title="О себе" accent>
            <p className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-line">
              {dp.about || "Расскажите о себе, чтобы другие могли узнать вас лучше..."}
            </p>
          </StorySection>
        )}

        {/* Interests — large, colorful tags */}
        {dp.interests.length > 0 && (
          <StorySection icon={Sparkles} title="Интересы">
            <div className="flex flex-wrap gap-2">
              {dp.interests.map(tag => (
                <span key={tag} className="text-[13px] bg-primary/8 text-primary border border-primary/12 px-4 py-2 rounded-full font-medium transition-all hover:bg-primary/15 hover:scale-105 cursor-default">{tag}</span>
              ))}
            </div>
          </StorySection>
        )}

        {/* ── Deep Profile Blocks ── */}
        <PersonalityBlock
          temperament={dp.temperament}
          personalityType={undefined}
          communicationStyle={dp.communicationStyle}
          isOwnProfile={isOwnProfile}
        />

        <LifeValuesBlock values={dp.lifeValues} isOwnProfile={isOwnProfile} />

        <LifestyleBlock lifestyle={dp.lifestyle} isOwnProfile={isOwnProfile} />

        <DatingStyleBlock goals={dp.communicationGoals} isOwnProfile={isOwnProfile} />

        {/* AI Profile Insights — for other profiles */}
        {!isOwnProfile && dp && myProfile && (
          <AiProfileInsights
            targetName={dp.name.split(" ")[0]}
            commonInterests={dp.interests.filter(i => (myProfile.interests || []).includes(i))}
            commonGoals={dp.communicationGoals.filter(g => (myProfile.communication_goals || []).includes(g))}
            temperament={dp.temperament}
            communicationStyle={dp.communicationStyle}
          />
        )}

        {/* Photos — immersive grid */}
        {galleryImages.length > 0 && (
          <StorySection icon={ImageIcon} title="Фотографии">
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
              {galleryImages.slice(0, 6).map((img, i) => (
                <div key={i} className={`relative overflow-hidden cursor-pointer group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}>
                  <img src={img} alt="" className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${i === 0 ? "aspect-square" : "aspect-square"}`} loading="lazy" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                </div>
              ))}
            </div>
            {galleryImages.length > 6 && (
              <button className="text-[13px] text-primary mt-3 hover:underline font-medium" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                Все {galleryImages.length} фото →
              </button>
            )}
          </StorySection>
        )}

        {/* Lifestyle */}
        {(hasLifestyle || isOwnProfile) && (
          <StorySection icon={Briefcase} title="Образ жизни">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(dp.work || isOwnProfile) && (
                <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3.5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Работа</p>
                    <p className="text-[14px] text-foreground font-medium">{dp.work || "Не указано"}</p>
                  </div>
                </div>
              )}
              {(dp.education || isOwnProfile) && (
                <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-3.5">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Образование</p>
                    <p className="text-[14px] text-foreground font-medium">{dp.education || "Не указано"}</p>
                  </div>
                </div>
              )}
            </div>
          </StorySection>
        )}

        {/* Communication goals */}
        {dp.communicationGoals.length > 0 && (
          <StorySection icon={Target} title="Цели общения">
            <div className="flex flex-wrap gap-2">
              {dp.communicationGoals.map(g => (
                <Badge key={g} variant="secondary" className="text-[13px] px-4 py-2 rounded-full font-medium">{g}</Badge>
              ))}
            </div>
          </StorySection>
        )}

        {/* Ideal date */}
        {(dp.idealDate || isOwnProfile) && (
          <StorySection icon={Coffee} title="Идеальное свидание" accent>
            <p className="text-[15px] text-foreground/70 leading-relaxed italic">
              {dp.idealDate ? `"${dp.idealDate}"` : "Расскажите о своём идеальном свидании..."}
            </p>
          </StorySection>
        )}

        {/* Favorites */}
        {(hasFavorites || isOwnProfile) && (
          <StorySection icon={Star} title="Любимые вещи">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Film, label: "Фильмы", items: dp.favoriteMovies, color: "bg-rose-500/10 text-rose-500" },
                { icon: Music, label: "Музыка", items: dp.favoriteMusic, color: "bg-violet-500/10 text-violet-500" },
                { icon: BookOpen, label: "Книги", items: dp.favoriteBooks, color: "bg-amber-500/10 text-amber-500" },
                { icon: MapPinned, label: "Места", items: dp.favoritePlaces, color: "bg-emerald-500/10 text-emerald-500" },
              ].filter(cat => cat.items.length > 0 || isOwnProfile).map(cat => (
                <div key={cat.label} className="flex gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cat.color.split(" ")[0]}`}>
                    <cat.icon className={`h-4 w-4 ${cat.color.split(" ")[1]}`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{cat.label}</p>
                    {cat.items.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.items.map((item: string) => (
                          <span key={item} className="text-[12px] text-foreground bg-secondary px-2.5 py-0.5 rounded-lg">{item}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-muted-foreground mt-0.5">Не указано</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </StorySection>
        )}

        {/* Info grid — compact, clean */}
        <StorySection title="Основная информация">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Возраст", value: dp.age ? `${dp.age} лет` : "—", icon: "👤" },
              { label: "Город", value: dp.city || "—", icon: "📍" },
              { label: "Пол", value: dp.gender === "male" ? "Мужской" : dp.gender === "female" ? "Женский" : "—", icon: "⚡" },
              { label: "Кого ищет", value: lookingForLabel, icon: "🎯" },
              { label: "Встречи", value: dp.readyForMeetings ? "Готов(а)" : "Нет", icon: "🤝" },
              { label: "Переписка", value: dp.readyForChat ? "Готов(а)" : "Нет", icon: "💬" },
            ].map(item => (
              <div key={item.label} className="bg-secondary/30 rounded-xl p-3">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                <p className="text-[14px] text-foreground mt-0.5 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </StorySection>

        {/* Trust & Safety */}
        {dbProfile && (
          <ProfileSafetyBlock
            profile={{
              avatarUrl: dbProfile.avatar_url, about: dbProfile.about, interests: dbProfile.interests,
              isVerified: (dbProfile as any).is_verified, isVip: dbProfile.is_vip, createdAt: dbProfile.created_at,
              city: dbProfile.city, age: dbProfile.age,
            }}
            isOwnProfile={isOwnProfile}
          />
        )}

        {isOwnProfile && <VerificationBanner isVerified={(dbProfile as any)?.is_verified} />}

        {!isOwnProfile && dp.readyForMeetings && <SafeMeetingTips />}

        {/* AI blocks */}
        {!isOwnProfile && dbProfile?.user_id && (
          <>
            <AiCoachCard targetUserId={dbProfile.user_id} targetName={dp.name.split(" ")[0]} context="profile" />
            <AiWingmanCard targetUserId={dbProfile.user_id} />
            <AiDateIdeasCard targetUserId={dbProfile.user_id} targetName={dp.name.split(" ")[0]} />
            <PersonalityCompatibilityCard targetUserId={dbProfile.user_id} />
            <AiCompatibilityCard targetUserId={dbProfile.user_id} />
            <AiFirstMessageCard targetUserId={dbProfile.user_id} onSelectMessage={async () => {
              if (!dbProfile?.user_id) return;
              try { const convId = await startConversation.mutateAsync(dbProfile.user_id); navigate(`/messages/${convId}`); } catch { toast.error("Ошибка"); }
            }} />
            <AiIcebreakerCard targetUserId={dbProfile.user_id} />
            <AiAvatarChat targetUserId={dbProfile.user_id} targetName={dp.name.split(" ")[0]} isOnline={dp.isOnline} />
          </>
        )}
        {isOwnProfile && (
          <>
            <PersonalityTestCard />
            <AiProfileScoreCard />
            <AiProfileTips />
          </>
        )}

        {/* Activity */}
        <StorySection icon={Activity} title="Активность">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Регистрация", value: dp.createdAt ? new Date(dp.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : "2026" },
              { label: "Статус", value: dp.isOnline ? "Онлайн" : "Недавно" },
              { label: "Постов", value: String(dp.postsCount) },
              { label: "Друзей", value: String(dp.friendsCount) },
            ].map(item => (
              <div key={item.label} className="bg-secondary/30 rounded-xl p-3 text-center">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">{item.label}</span>
                <p className="text-[15px] text-foreground mt-0.5 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </StorySection>

        {/* Posts */}
        <StorySection icon={FileText} title="Посты">
          {userPosts.length > 0 ? (
            <div className="space-y-3">
              {userPosts.slice(0, 3).map(post => (
                <PostCard key={post.id} post={{ ...post, author: dp.isMock && dp.mockUser ? dp.mockUser : mockCurrentUser }} />
              ))}
              {userPosts.length > 3 && (
                <p className="text-[13px] text-primary cursor-pointer hover:underline text-center pt-1 font-medium">Показать все посты →</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-muted-foreground text-[14px]">Публикаций пока нет</p>
            </div>
          )}
        </StorySection>

        {/* Friends */}
        <StorySection icon={Users} title="Друзья">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {userFriends.slice(0, 12).map(f => (
              <Link key={f.id} to={`/profile/${f.username}`} className="text-center group">
                <Avatar className="h-16 w-16 mx-auto ring-2 ring-border/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-105">
                  <AvatarImage src={f.avatar} alt={f.name} className="object-cover" />
                  <AvatarFallback className="bg-secondary text-sm">{f.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-[12px] text-foreground mt-2 truncate font-medium">{f.name.split(" ")[0]}</p>
                {f.isOnline && <span className="text-[10px] text-green-500">онлайн</span>}
              </Link>
            ))}
          </div>
        </StorySection>
      </div>

      {/* Dialogs */}
      <ImagePreviewDialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen} preview={avatarUpload.preview} uploading={avatarUpload.uploading} title="Новый аватар"
        onConfirm={async () => { await avatarUpload.upload(); setAvatarDialogOpen(false); }} onCancel={() => { avatarUpload.clearSelection(); setAvatarDialogOpen(false); }} />
      <ImagePreviewDialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen} preview={coverUpload.preview} uploading={coverUpload.uploading} title="Новая обложка"
        onConfirm={async () => { await coverUpload.upload(); setCoverDialogOpen(false); }} onCancel={() => { coverUpload.clearSelection(); setCoverDialogOpen(false); }} />
      <PhotoGalleryLightbox images={galleryImages} currentIndex={lightboxIndex} open={lightboxOpen} onOpenChange={setLightboxOpen} onNavigate={setLightboxIndex} />
      {dbProfile?.user_id && <ReportDialog open={reportOpen} onOpenChange={setReportOpen} reportedUserId={dbProfile.user_id} reportedName={dp.name} />}
    </div>
  );
}
