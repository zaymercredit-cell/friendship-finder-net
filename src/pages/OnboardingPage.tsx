import { useState, useEffect } from "react";
import PersonalityTestCard from "@/components/ai/PersonalityTestCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Camera, ArrowRight, ArrowLeft, MapPin, Heart, Sparkles, Users, Check,
  User, Target, Search
} from "lucide-react";
import { toast } from "sonner";
import { allInterests, communicationGoalOptions, cities, mockUsers, calculateMatchScore, currentUser } from "@/lib/mock-data";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";

const TOTAL_STEPS = 8;

const goalIcons: Record<string, string> = {
  "общение": "💬",
  "дружба": "🤝",
  "отношения": "❤️",
  "совместные прогулки": "🚶",
  "компания для мероприятий": "🎉",
};

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [age, setAge] = useState<string>(profile?.age?.toString() || "");
  const [city, setCity] = useState(profile?.city || "");
  const [citySearch, setCitySearch] = useState("");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [goals, setGoals] = useState<string[]>(profile?.communication_goals || []);
  const [lookingFor, setLookingFor] = useState(profile?.looking_for_gender || "any");
  const [gender, setGender] = useState(profile?.gender || "");
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const avatarUpload = useImageUpload({
    bucket: "avatars",
    maxSize: 5 * 1024 * 1024,
    onSuccess: async (url) => {
      setAvatarUrl(url);
      if (user) {
        await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      }
    },
  });

  const progress = (step / TOTAL_STEPS) * 100;

  const canNext = () => {
    switch (step) {
      case 1: return true; // photo optional
      case 2: return firstName.trim().length > 0;
      case 3: return city.trim().length > 0;
      case 4: return interests.length >= 3;
      case 5: return goals.length >= 1;
      case 6: return true;
      case 7: return true; // personality test optional
      case 8: return true;
      default: return true;
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      age: age ? parseInt(age) : null,
      city,
      gender,
      interests,
      communication_goals: goals,
      looking_for_gender: lookingFor,
    }).eq("user_id", user.id);
    await refreshProfile();
    setSaving(false);
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      // Save on step transitions to persist data
      if (step === 2 || step === 3 || step === 4 || step === 5 || step === 6) {
        await saveProfile();
      }
      setStep(step + 1);
    } else {
      await saveProfile();
      toast.success("Добро пожаловать в ВДрузьях! 🎉");
      navigate("/feed", { replace: true });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const toggleGoal = (g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const filteredCities = cities.filter(c =>
    !citySearch || c.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Recommended users for step 7
  const recommendations = mockUsers.slice(0, 10).map(u => ({
    user: u,
    score: calculateMatchScore(currentUser, u),
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">В</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Настройка профиля</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/feed")}>
            Пропустить
          </Button>
        </div>
        <div className="max-w-lg mx-auto mt-2">
          <Progress value={progress} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1">Шаг {step} из {TOTAL_STEPS}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Step 1: Photo */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in-50 duration-300">
              <div>
                <Camera className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Добавьте фото</h2>
                <p className="text-sm text-muted-foreground mt-1">Профили с фото получают в 5 раз больше симпатий</p>
              </div>
              <div className="relative inline-block group">
                <Avatar className="h-36 w-36 mx-auto ring-4 ring-primary/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-4xl bg-secondary">{firstName?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 rounded-full bg-foreground/0 hover:bg-foreground/30 transition-colors cursor-pointer flex items-center justify-center group-hover:bg-foreground/30">
                  <Camera className="h-8 w-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { avatarUpload.selectFile(f); setDialogOpen(true); }
                  }} />
                </label>
              </div>
              {avatarUpload.uploading && <p className="text-xs text-muted-foreground">Загрузка...</p>}
            </div>
          )}

          {/* Step 2: Name & Age */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <User className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Как вас зовут?</h2>
                <p className="text-sm text-muted-foreground mt-1">Укажите имя и возраст</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Имя *</Label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Алексей" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Фамилия</Label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Иванов" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Возраст</Label>
                    <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" min={18} max={100} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Пол</Label>
                    <div className="flex gap-2 mt-1">
                      <Button type="button" size="sm" variant={gender === "male" ? "default" : "outline"} className="flex-1 text-xs" onClick={() => setGender("male")}>Мужской</Button>
                      <Button type="button" size="sm" variant={gender === "female" ? "default" : "outline"} className="flex-1 text-xs" onClick={() => setGender("female")}>Женский</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: City */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Ваш город</h2>
                <p className="text-sm text-muted-foreground mt-1">Так мы покажем людей рядом с вами</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    placeholder="Найти город..."
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredCities.map(c => (
                    <Button
                      key={c}
                      variant={city === c ? "default" : "outline"}
                      size="sm"
                      className="justify-start text-xs h-9"
                      onClick={() => setCity(c)}
                    >
                      {city === c && <Check className="h-3 w-3 mr-1" />}
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Ваши интересы</h2>
                <p className="text-sm text-muted-foreground mt-1">Выберите минимум 3 интереса</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-5">
                <div className="flex flex-wrap gap-2">
                  {allInterests.map(i => (
                    <Badge
                      key={i}
                      variant={interests.includes(i) ? "default" : "secondary"}
                      className="cursor-pointer text-sm px-3 py-1.5 transition-all hover:scale-105"
                      onClick={() => toggleInterest(i)}
                    >
                      {interests.includes(i) && <Check className="h-3 w-3 mr-1" />}
                      {i}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Выбрано: {interests.length} из {allInterests.length}
                  {interests.length < 3 && <span className="text-destructive ml-2">Нужно ещё {3 - interests.length}</span>}
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Communication Goals */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <Target className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Цель общения</h2>
                <p className="text-sm text-muted-foreground mt-1">Что вы ищете на платформе?</p>
              </div>
              <div className="space-y-2">
                {communicationGoalOptions.map(g => (
                  <button
                    key={g}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                      goals.includes(g)
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:bg-card/80"
                    }`}
                    onClick={() => toggleGoal(g)}
                  >
                    <span className="text-2xl">{goalIcons[g] || "🎯"}</span>
                    <span className="text-sm font-medium capitalize">{g}</span>
                    {goals.includes(g) && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Looking For Gender */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <Heart className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Кого вы ищете?</h2>
                <p className="text-sm text-muted-foreground mt-1">Для более точных рекомендаций</p>
              </div>
              <div className="space-y-3">
                {[
                  { value: "male", label: "Мужчин", emoji: "👨" },
                  { value: "female", label: "Женщин", emoji: "👩" },
                  { value: "any", label: "Не важно", emoji: "🌈" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`w-full flex items-center gap-3 p-5 rounded-lg border transition-all text-left ${
                      lookingFor === opt.value
                        ? "bg-primary/10 border-primary/40"
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                    onClick={() => setLookingFor(opt.value)}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-base font-medium text-foreground">{opt.label}</span>
                    {lookingFor === opt.value && <Check className="h-5 w-5 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Personality Test */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Узнайте свой психотип</h2>
                <p className="text-sm text-muted-foreground mt-1">Это поможет найти совместимых людей</p>
              </div>
              <PersonalityTestCard compact />
            </div>
          )}

          {/* Step 8: First Recommendations */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Ваши первые симпатии</h2>
                <p className="text-sm text-muted-foreground mt-1">Поставьте симпатии, чтобы начать знакомства</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map(({ user: u, score }) => (
                  <div key={u.id} className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="relative aspect-square">
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">{score}%</div>
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <p className="text-xs font-semibold text-white">{u.name.split(" ")[0]}, {u.age}</p>
                        <p className="text-[10px] text-white/70">{u.city}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <Button
                        size="sm"
                        variant={likedUsers.has(u.id) ? "default" : "outline"}
                        className="w-full h-7 text-xs gap-1"
                        onClick={() => setLikedUsers(prev => {
                          const next = new Set(prev);
                          if (next.has(u.id)) next.delete(u.id);
                          else next.add(u.id);
                          return next;
                        })}
                      >
                        <Heart className={`h-3 w-3 ${likedUsers.has(u.id) ? "fill-current" : ""}`} />
                        {likedUsers.has(u.id) ? "Нравится" : "Симпатия"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {likedUsers.size > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Вы отметили {likedUsers.size} {likedUsers.size === 1 ? "человека" : "людей"} ❤️
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <Button onClick={handleNext} disabled={!canNext() || saving} className="gap-1.5 min-w-[140px]">
              {saving ? "Сохранение..." : step === TOTAL_STEPS ? "Начать!" : "Далее"}
              {step < TOTAL_STEPS && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Image preview dialog */}
      <ImagePreviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        preview={avatarUpload.preview}
        uploading={avatarUpload.uploading}
        onConfirm={() => avatarUpload.upload()}
        onCancel={() => avatarUpload.clearSelection()}
        title="Фото профиля"
      />
    </div>
  );
}
