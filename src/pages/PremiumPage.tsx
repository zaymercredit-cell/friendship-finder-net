import { Crown, Heart, Eye, Zap, Star, Shield, SlidersHorizontal, MessageCircle, Gift, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useVipStatus } from "@/hooks/useVipStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const features = [
  { icon: Heart, label: "Безлимитные симпатии", desc: "Ставьте симпатии без ограничений каждый день" },
  { icon: Eye, label: "Кто смотрел профиль", desc: "Видьте всех, кто посещал вашу страницу" },
  { icon: Star, label: "Кто поставил симпатию", desc: "Узнайте, кому вы нравитесь до совпадения" },
  { icon: Zap, label: "Boost профиля", desc: "1 бесплатный boost в неделю для большей видимости" },
  { icon: SlidersHorizontal, label: "Расширенные фильтры", desc: "Точный поиск по всем параметрам" },
  { icon: Shield, label: "Приоритет в Discover", desc: "Ваш профиль показывается чаще и выше" },
  { icon: MessageCircle, label: "5 Super Like в день", desc: "Привлекайте внимание тех, кто вам нравится" },
  { icon: Crown, label: "VIP значок", desc: "Выделяйтесь среди других пользователей" },
  { icon: Gift, label: "Виртуальные подарки", desc: "Отправляйте подарки в чатах" },
  { icon: Sparkles, label: "AI Premium", desc: "Глубокий анализ совместимости и продвинутые советы" },
];

const plans = [
  { period: "1 месяц", price: "499 ₽", pricePerMonth: "499 ₽/мес", months: 1, popular: false },
  { period: "3 месяца", price: "999 ₽", pricePerMonth: "333 ₽/мес", months: 3, popular: true, save: "Экономия 33%" },
  { period: "12 месяцев", price: "2 999 ₽", pricePerMonth: "250 ₽/мес", months: 12, popular: false, save: "Экономия 50%" },
];

const comparison = [
  ["Симпатии в день", "20", "∞"],
  ["Super Like", "1/день", "5/день"],
  ["Просмотры профиля", "Скрыты", "Открыты"],
  ["Кто лайкнул", "Скрыты", "Открыты"],
  ["Boost", "—", "1/неделю"],
  ["Расширенные фильтры", "—", "✓"],
  ["Приоритет в выдаче", "—", "✓"],
  ["Подарки в чатах", "—", "✓"],
  ["AI Premium", "—", "✓"],
];

const testimonials = [
  { name: "Анна", text: "VIP помог мне найти идеального человека за неделю!", rating: 5 },
  { name: "Дмитрий", text: "Boost реально работает — получил в 3 раза больше лайков", rating: 5 },
  { name: "Мария", text: "Функция 'кто лайкнул' — просто незаменима", rating: 5 },
];

export default function PremiumPage() {
  const { user } = useAuth();
  const { data: isVip } = useVipStatus();
  const queryClient = useQueryClient();

  const handleActivate = async (months: number) => {
    if (!user) return;
    const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("subscriptions").insert({
      user_id: user.id, type: "vip", status: "active", expires_at: expiresAt,
    });
    await supabase.from("profiles").update({ is_vip: true }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["vip-status"] });
    toast.success("🎉 VIP активирован!");
  };

  if (isVip) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-5">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-hero animate-pulse">
          <Crown className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-[1.75rem] font-bold text-foreground tracking-tight">Вы — VIP ✦</h1>
        <p className="text-muted-foreground text-[15px]">Все премиум-функции активны. Наслаждайтесь максимумом ВДрузьях!</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {["Безлимитные лайки", "Boost", "Super Like ×5", "Подарки"].map(f => (
            <Badge key={f} variant="secondary" className="text-[11px] gap-1">
              <Check className="h-3 w-3 text-success" />{f}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-8">
      {/* Hero */}
      <div className="text-center pt-6 space-y-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-hero">
            <Crown className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 mx-auto animate-ping opacity-20" />
        </div>
        <div>
          <h1 className="text-[1.75rem] md:text-[2rem] font-bold text-foreground tracking-tight">ВДрузьях Premium</h1>
          <p className="text-muted-foreground text-[15px] max-w-md mx-auto mt-2 leading-relaxed">
            Получите максимум от знакомств — больше возможностей, видимости и внимания
          </p>
        </div>
        {/* Social proof */}
        <div className="flex items-center justify-center gap-4 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1"><Crown className="h-3 w-3 text-amber-500" />2 500+ VIP</span>
          <span>•</span>
          <span>4.9 ★ рейтинг</span>
          <span>•</span>
          <span>×3 больше матчей</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.period}
            className={`relative premium-card p-6 text-center space-y-4 transition-all ${
              plan.popular ? "border-amber-500/40 ring-1 ring-amber-500/20 shadow-hero" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-primary-foreground text-[10px] border-0 shadow-sm px-3">
                Популярный
              </Badge>
            )}
            <p className="text-[13px] text-muted-foreground font-medium">{plan.period}</p>
            <div>
              <p className="text-[1.75rem] font-bold text-foreground">{plan.price}</p>
              <p className="text-[12px] text-muted-foreground">{plan.pricePerMonth}</p>
            </div>
            {plan.save && <Badge variant="secondary" className="text-[10px] text-success">{plan.save}</Badge>}
            <Button
              onClick={() => handleActivate(plan.months)}
              className={`w-full gap-2 rounded-xl h-10 ${
                plan.popular
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-primary-foreground shadow-glow"
                  : ""
              }`}
              variant={plan.popular ? "default" : "outline"}
            >
              <Crown className="h-4 w-4" />
              Выбрать
            </Button>
          </div>
        ))}
      </div>

      {/* Features */}
      <div>
        <h2 className="text-[1.125rem] font-semibold text-foreground text-center mb-6">Что входит в Premium</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.label} className="premium-card p-4 flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">{f.label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-[1.125rem] font-semibold text-foreground text-center mb-4">Отзывы VIP-пользователей</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {testimonials.map((t) => (
            <div key={t.name} className="premium-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[12px] font-bold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-amber-500">{"★".repeat(t.rating)}</p>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div className="premium-card overflow-hidden">
        <div className="grid grid-cols-3 text-center text-[13px] font-medium border-b border-border/40 bg-secondary/30">
          <div className="p-3.5 text-muted-foreground text-left pl-5">Функция</div>
          <div className="p-3.5 text-muted-foreground">Бесплатно</div>
          <div className="p-3.5 text-amber-600 font-semibold">Premium ✦</div>
        </div>
        {comparison.map(([feature, free, vip]) => (
          <div key={feature} className="grid grid-cols-3 text-center text-[13px] border-b border-border/20 last:border-0">
            <div className="p-3.5 text-foreground text-left pl-5 font-medium">{feature}</div>
            <div className="p-3.5 text-muted-foreground">{free}</div>
            <div className="p-3.5 text-amber-600 font-medium">{vip}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-3 pb-4">
        <Button
          onClick={() => handleActivate(3)}
          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-primary-foreground shadow-glow gap-2 h-12 px-8 text-[15px] rounded-2xl"
        >
          <Crown className="h-5 w-5" />
          Попробовать Premium
        </Button>
        <p className="text-[11px] text-muted-foreground">Отмена в любой момент • Безопасная оплата</p>
      </div>
    </div>
  );
}
