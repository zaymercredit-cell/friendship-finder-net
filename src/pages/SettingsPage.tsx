import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Bell, Lock, Ban, Camera, Heart, Brain } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBlocks, useUnblockUser } from "@/hooks/useBlocks";
import { useQuery } from "@tanstack/react-query";
import { useAiAvatarSettings } from "@/hooks/useAiAvatar";
import { Bot } from "lucide-react";
import {
  allInterests, communicationGoalOptions, lookingForGenderOptions, cityModeOptions
} from "@/lib/mock-data";

function AiAvatarSettingsBlock({ avatarSummary, setAvatarSummary }: { avatarSummary: string; setAvatarSummary: (v: string) => void }) {
  const { isEnabled, personalitySummary, toggle, updateSummary, isLoading } = useAiAvatarSettings();
  const [localSummary, setLocalSummary] = useState(personalitySummary);

  if (isLoading) return null;

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-5">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        AI-аватар профиля
      </h3>
      <p className="text-xs text-muted-foreground">
        Когда вы офлайн, AI-аватар может рассказать о вас другим пользователям на основе вашего профиля.
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Включить AI-аватар</p>
          <p className="text-xs text-muted-foreground">Другие пользователи смогут задавать вопросы вашему AI-аватару</p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={(checked) => toggle.mutate(checked)} />
      </div>
      {isEnabled && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Дополнительно расскажите о себе для AI-аватара</Label>
            <Input
              value={localSummary || personalitySummary}
              onChange={(e) => setLocalSummary(e.target.value)}
              placeholder="Например: Люблю активный отдых, готовлю итальянскую кухню, работаю дизайнером..."
              className="mt-1"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Это поможет AI-аватару лучше представлять вас</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => updateSummary.mutate(localSummary || personalitySummary)}>
            Сохранить описание
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [city, setCity] = useState(profile?.city || "");
  const [about, setAbout] = useState(profile?.about || "");
  const [avatarSummary, setAvatarSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingDating, setSavingDating] = useState(false);
  const [gender, setGender] = useState(profile?.gender || "");
  const [lookingFor, setLookingFor] = useState(profile?.looking_for_gender || "any");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile?.communication_goals || []);
  const [showInDiscover, setShowInDiscover] = useState(profile?.show_in_discover !== false);
  const [readyForChat, setReadyForChat] = useState(profile?.ready_for_chat !== false);
  const [readyForMeetings, setReadyForMeetings] = useState(profile?.ready_for_meetings || false);
  const { data: blocks } = useBlocks();
  const unblock = useUnblockUser();
  const blockedIds = (blocks || []).map((b: any) => b.blocked_user_id);
  const { data: blockedProfiles } = useQuery({
    queryKey: ["blocked-profiles", blockedIds],
    queryFn: async () => {
      if (!blockedIds.length) return [];
      const { data } = await supabase.from("profiles").select("user_id, first_name, last_name, avatar_url").in("user_id", blockedIds);
      return data || [];
    },
    enabled: blockedIds.length > 0,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      username,
      city,
      about,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Ошибка сохранения");
    } else {
      toast.success("Профиль обновлён");
      refreshProfile();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Настройки</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full bg-card border border-border shadow-card rounded-lg h-10 flex-wrap">
          <TabsTrigger value="profile" className="flex-1 text-xs gap-1.5 rounded-md"><User className="h-3.5 w-3.5" />Профиль</TabsTrigger>
          <TabsTrigger value="dating" className="flex-1 text-xs gap-1.5 rounded-md"><Heart className="h-3.5 w-3.5" />Знакомства</TabsTrigger>
          <TabsTrigger value="privacy" className="flex-1 text-xs gap-1.5 rounded-md"><Lock className="h-3.5 w-3.5" />Приватность</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 text-xs gap-1.5 rounded-md"><Bell className="h-3.5 w-3.5" />Уведомления</TabsTrigger>
          <TabsTrigger value="security" className="flex-1 text-xs gap-1.5 rounded-md"><Shield className="h-3.5 w-3.5" />Безопасность</TabsTrigger>
          <TabsTrigger value="blocked" className="flex-1 text-xs gap-1.5 rounded-md"><Ban className="h-3.5 w-3.5" />Чёрный список</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 text-xs gap-1.5 rounded-md"><Brain className="h-3.5 w-3.5" />AI</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || ''} />
                  <AvatarFallback className="text-xl">{profile?.first_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{profile?.first_name} {profile?.last_name}</h3>
                <p className="text-sm text-muted-foreground">@{profile?.username || 'user'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Имя</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Фамилия</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Никнейм</Label><Input value={username} onChange={e => setUsername(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Город</Label><Input value={city} onChange={e => setCity(e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">О себе</Label><Input value={about} onChange={e => setAbout(e.target.value)} className="mt-1" /></div>
            <div>
              <Label className="text-xs mb-2 block">Интересы</Label>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.interests || []).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                <Badge variant="outline" className="text-xs cursor-pointer border-dashed">+ Добавить</Badge>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="dating" className="mt-4 space-y-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Параметры знакомств
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Пол</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужчина</SelectItem>
                    <SelectItem value="female">Женщина</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Кого ищу</Label>
                <Select value={lookingFor} onValueChange={setLookingFor}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {lookingForGenderOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Возраст</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Ваш возраст" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">География поиска</Label>
                <Select defaultValue="my_city">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cityModeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Цель общения</Label>
              <div className="flex flex-wrap gap-1.5">
                {communicationGoalOptions.map(g => (
                  <Badge
                    key={g}
                    variant={selectedGoals.includes(g) ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Показывать меня в рекомендациях</p>
                  <p className="text-xs text-muted-foreground">Другие пользователи увидят вашу анкету</p>
                </div>
                <Switch checked={showInDiscover} onCheckedChange={setShowInDiscover} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Готов к переписке</p>
                  <p className="text-xs text-muted-foreground">Показать что вы открыты к общению</p>
                </div>
                <Switch checked={readyForChat} onCheckedChange={setReadyForChat} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Готов к встречам</p>
                  <p className="text-xs text-muted-foreground">Готовы встретиться лично</p>
                </div>
                <Switch checked={readyForMeetings} onCheckedChange={setReadyForMeetings} />
              </div>
            </div>

            <Button disabled={savingDating} onClick={async () => {
              if (!user) return;
              setSavingDating(true);
              const { error } = await supabase.from("profiles").update({
                gender: gender || null,
                looking_for_gender: lookingFor,
                age: age ? parseInt(age) : null,
                communication_goals: selectedGoals,
                show_in_discover: showInDiscover,
                ready_for_chat: readyForChat,
                ready_for_meetings: readyForMeetings,
              }).eq("user_id", user.id);
              setSavingDating(false);
              if (error) { toast.error("Ошибка сохранения"); }
              else { toast.success("Настройки знакомств сохранены"); refreshProfile(); }
            }}>
              {savingDating ? "Сохранение..." : "Сохранить настройки знакомств"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="mt-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-5">
            {[
              { label: "Кто видит мой профиль", desc: "Все пользователи" },
              { label: "Кто видит меня в знакомствах", desc: "Все пользователи" },
              { label: "Кто может писать мне", desc: "Только друзья и совпадения" },
              { label: "Кто может добавлять в друзья", desc: "Все пользователи" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Button variant="secondary" size="sm" className="text-xs">Изменить</Button>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Анонимный просмотр профилей</p>
                <p className="text-xs text-muted-foreground">Вы не будете отображаться в списке просмотров чужих профилей</p>
              </div>
              <Switch
                defaultChecked={profile?.anonymous_browsing || false}
                onCheckedChange={async (checked) => {
                  if (!user) return;
                  await supabase.from("profiles").update({ anonymous_browsing: checked } as any).eq("user_id", user.id);
                  refreshProfile();
                  toast.success(checked ? "Анонимный просмотр включён" : "Анонимный просмотр выключен");
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Показывать меня на карте</p>
                <p className="text-xs text-muted-foreground">Другие пользователи смогут видеть вас на карте знакомств</p>
              </div>
              <Switch
                defaultChecked={(profile as any)?.show_on_map !== false}
                onCheckedChange={async (checked) => {
                  if (!user) return;
                  await supabase.from("profiles").update({ show_on_map: checked } as any).eq("user_id", user.id);
                  refreshProfile();
                  toast.success(checked ? "Вы видимы на карте" : "Вы скрыты с карты");
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-4">
            {[
              "Лайки", "Комментарии", "Заявки в друзья", "Сообщения", "Симпатии", "Совпадения", "События", "Сообщества",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Смена пароля</h3>
              <div className="space-y-3 max-w-sm">
                <div><Label className="text-xs">Текущий пароль</Label><Input type="password" className="mt-1" /></div>
                <div><Label className="text-xs">Новый пароль</Label><Input type="password" className="mt-1" /></div>
                <Button size="sm">Сменить пароль</Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Активные сессии</h3>
              <p className="text-xs text-muted-foreground mb-3">Вы вошли с 1 устройства</p>
              <Button variant="destructive" size="sm" className="text-xs">Выйти со всех устройств</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="mt-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6">
            {!blockedIds.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">У вас нет заблокированных пользователей</p>
            ) : (
              <div className="space-y-3">
                {(blockedProfiles || []).map((p: any) => (
                  <div key={p.user_id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        {p.first_name?.[0] || "?"}
                      </div>
                      <span className="text-sm font-medium">{p.first_name} {p.last_name}</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => unblock.mutate(p.user_id)}>
                      Разблокировать
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          <div className="bg-card rounded-lg border border-border shadow-card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI помощник знакомств
            </h3>
            {[
              { label: "Подсказки первого сообщения", desc: "AI предложит варианты как начать разговор" },
              { label: "Варианты ответов в чате", desc: "Предложения для продолжения диалога" },
              { label: "Темы для общения", desc: "AI подберёт темы на основе общих интересов" },
              { label: "Анализ совместимости", desc: "AI-оценка совместимости в профилях" },
              { label: "Советы по профилю", desc: "Рекомендации для улучшения анкеты" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>

          <AiAvatarSettingsBlock avatarSummary={avatarSummary} setAvatarSummary={setAvatarSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
