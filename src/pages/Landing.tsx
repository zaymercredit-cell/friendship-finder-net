import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart, MessageCircle, Users, Shield, Sparkles, Target, MapPin,
  UserCheck, ArrowRight, CheckCircle, Star, Zap, Globe, Eye, Calendar,
  ChevronRight, Play, Lock
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { cities } from "@/lib/mock-data";
import { cityToSlug } from "./seo/DatingCityPage";

const features = [
  { icon: Heart, title: "Умные знакомства", desc: "AI-алгоритм подбирает людей по интересам, возрасту и целям общения", accent: "bg-primary/10 text-primary" },
  { icon: Sparkles, title: "AI-совместимость", desc: "Персональный анализ совместимости и рекомендации в реальном времени", accent: "bg-accent/10 text-accent" },
  { icon: MessageCircle, title: "Безопасное общение", desc: "Переписка после взаимной симпатии. Полная приватность и модерация", accent: "bg-success/10 text-success" },
  { icon: Target, title: "Чёткие цели", desc: "Дружба, отношения, прогулки или компания — каждый находит своё", accent: "bg-warning/10 text-warning" },
  { icon: Shield, title: "Верификация", desc: "Проверенные профили, рейтинг доверия и модерация 24/7", accent: "bg-info/10 text-info" },
  { icon: Users, title: "Живые сообщества", desc: "Группы по интересам, события и встречи единомышленников", accent: "bg-destructive/10 text-destructive" },
];

const stats = [
  { value: "50 000+", label: "Пользователей", icon: Users },
  { value: "12 000+", label: "Совпадений", icon: Heart },
  { value: "300+", label: "Сообществ", icon: Globe },
  { value: "95%", label: "Реальных анкет", icon: Shield },
];

const showcaseItems = [
  {
    icon: Heart, badge: "Знакомства",
    title: "Находите людей, которые вам подходят",
    desc: "Смотрите анкеты, ставьте симпатии, получайте совпадения. Свайпы, фильтры, AI-рекомендации — всё для быстрого и точного поиска.",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
  },
  {
    icon: MessageCircle, badge: "Мессенджер",
    title: "Общайтесь без лишних барьеров",
    desc: "Удобный чат с отправкой фото, AI-подсказками для первого сообщения и темами для разговора.",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
  },
  {
    icon: Calendar, badge: "События",
    title: "Встречайтесь в реальной жизни",
    desc: "Создавайте и находите встречи, прогулки, вечеринки. Знакомьтесь офлайн в комфортной обстановке.",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
  },
];

const trustPoints = [
  "Верификация профилей через селфи",
  "Модерация контента 24/7",
  "Защита персональных данных",
  "Рейтинг доверия для каждого пользователя",
];

const avatarPool = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="ВДрузьях — Социальная сеть знакомств и общения"
        description="Находите людей по интересам, городу и целям общения. Дружба, отношения, совместные прогулки — всё начинается здесь."
        canonical="https://mutual-connections.lovable.app/"
      />

      {/* Header */}
      <header className="border-b border-border/30 glass-strong sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-sm font-bold text-primary-foreground">В</span>
            </div>
            <span className="text-[18px] font-bold text-foreground tracking-[-0.02em]">ВДрузьях</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="text-[14px] font-medium h-9 px-4">Войти</Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="text-[14px] font-semibold h-9 px-5 rounded-xl shadow-glow">Начать</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-primary/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-15%] w-[500px] h-[500px] bg-accent/[0.05] rounded-full blur-[100px]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary/[0.06] text-primary text-[13px] font-semibold px-4 py-2 rounded-full mb-8 border border-primary/10">
                <Zap className="h-3.5 w-3.5" />
                Платформа нового поколения
              </div>
              <h1 className="text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem] font-extrabold tracking-[-0.04em] text-foreground mb-6 leading-[1.05]">
                Найди своих
                <br />
                <span className="text-gradient">людей.</span>
              </h1>
              <p className="text-[17px] md:text-[18px] text-muted-foreground max-w-[460px] mb-10 leading-[1.7]">
                Знакомьтесь с теми, кто разделяет ваши интересы.
                AI подберёт идеальных собеседников — для дружбы, отношений или совместных прогулок.
              </p>
              <div className="flex items-center gap-3.5 flex-wrap">
                <Link to="/auth/register">
                  <Button size="lg" className="h-13 px-8 text-[15px] font-semibold gap-2 rounded-xl shadow-glow hover:shadow-hero transition-all">
                    Создать анкету бесплатно
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline" className="h-13 px-8 text-[15px] font-medium rounded-xl">
                    Войти
                  </Button>
                </Link>
              </div>
              {/* Social proof */}
              <div className="flex items-center gap-3.5 mt-12 pt-8 border-t border-border/40">
                <div className="flex -space-x-2.5">
                  {avatarPool.map((a, i) => (
                    <img key={i} src={a} alt="" className="h-9 w-9 rounded-full border-[2.5px] border-card object-cover" />
                  ))}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">50 000+ пользователей</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}
                    <span className="text-[12px] text-muted-foreground ml-1">4.8 / 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:block relative h-[520px]">
              {/* Main card */}
              <div className="absolute top-0 left-4 w-56 premium-card overflow-hidden animate-slide-up shadow-hero" style={{ animationDelay: "0.1s" }}>
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face" alt="" className="w-full aspect-[3/4] object-cover" />
                  <div className="photo-overlay-strong absolute inset-0" />
                  <div className="absolute top-3 right-3 gradient-primary text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    92%
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[15px] font-bold text-primary-foreground">Мария, 26</p>
                    <p className="text-[11px] text-primary-foreground/70 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />Москва</p>
                  </div>
                </div>
                <div className="p-3 flex gap-1.5">
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">путешествия</span>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">фото</span>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">кино</span>
                </div>
              </div>
              {/* Second card */}
              <div className="absolute top-24 right-0 w-52 premium-card overflow-hidden animate-slide-up shadow-elevated" style={{ animationDelay: "0.35s" }}>
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face" alt="" className="w-full aspect-[3/4] object-cover" />
                  <div className="photo-overlay-strong absolute inset-0" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 glass rounded-lg text-[10px] font-medium px-2 py-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-success pulse-dot" />онлайн
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[15px] font-bold text-primary-foreground">Дмитрий, 29</p>
                    <p className="text-[11px] text-primary-foreground/70 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />СПб</p>
                  </div>
                </div>
              </div>
              {/* Match notification */}
              <div className="absolute bottom-12 left-10 glass-strong rounded-2xl p-4 shadow-hero animate-slide-up border border-border/40" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                    <Heart className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">Новое совпадение! 🎉</p>
                    <p className="text-[12px] text-muted-foreground">Вы понравились друг другу</p>
                  </div>
                </div>
              </div>
              {/* Stats chip */}
              <div className="absolute top-2 right-16 glass rounded-xl px-3.5 py-2 shadow-elevated animate-slide-up border border-border/30" style={{ animationDelay: "0.8s" }}>
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[12px] font-medium text-foreground">24 просмотра сегодня</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="border-y border-border/30 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 stagger-children">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-[2.25rem] font-extrabold text-foreground tracking-tight leading-none">{s.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 md:py-32">
        <div className="text-center mb-16">
          <span className="text-[13px] font-semibold text-primary uppercase tracking-widest">Возможности</span>
          <h2 className="text-[1.75rem] md:text-[2.25rem] text-foreground mt-3 mb-4 font-bold tracking-tight">
            Всё для настоящих знакомств
          </h2>
          <p className="text-[16px] text-muted-foreground max-w-[480px] mx-auto leading-relaxed">
            Умные алгоритмы, безопасное общение и живое сообщество — в одном месте
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {features.map((f) => (
            <div key={f.title} className="premium-card p-6 group">
              <div className={`h-12 w-12 rounded-2xl ${f.accent} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ SHOWCASE ═══════════ */}
      <section className="bg-card/40 border-y border-border/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24 md:py-32 space-y-24">
          <div className="text-center">
            <span className="text-[13px] font-semibold text-primary uppercase tracking-widest">Как это работает</span>
            <h2 className="text-[1.75rem] md:text-[2.25rem] text-foreground mt-3 font-bold tracking-tight">
              Знакомьтесь. Общайтесь. Встречайтесь.
            </h2>
          </div>
          {showcaseItems.map((item, i) => (
            <div key={item.title} className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
              <div className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
                <div className="inline-flex items-center gap-2 text-primary text-[13px] font-semibold mb-4">
                  <item.icon className="h-4 w-4" />
                  {item.badge}
                </div>
                <h3 className="text-[1.375rem] md:text-[1.625rem] font-bold text-foreground mb-4 leading-tight tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
                  {item.desc}
                </p>
                <Link to="/auth/register">
                  <Button variant="outline" className="gap-2 rounded-xl text-[14px]">
                    Попробовать <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className={`${i % 2 === 1 ? "md:[direction:ltr]" : ""}`}>
                <div className="premium-card overflow-hidden shadow-hero">
                  <img src={item.img} alt={item.title} className="w-full aspect-[3/2] object-cover" loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 md:py-32">
        <h2 className="text-[1.75rem] md:text-[2.25rem] text-center text-foreground mb-16 font-bold tracking-tight">
          Три шага к знакомству
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", icon: UserCheck, title: "Создайте анкету", desc: "Загрузите фото, укажите интересы и цели. AI проанализирует ваш профиль для лучших рекомендаций" },
            { step: "02", icon: Sparkles, title: "Получайте рекомендации", desc: "Алгоритм подберёт людей с высокой совместимостью по интересам, стилю общения и городу" },
            { step: "03", icon: Heart, title: "Начните общение", desc: "Взаимная симпатия откроет диалог. AI предложит тему для разговора и icebreaker" },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div className="relative inline-block mb-6">
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-2.5 -right-2.5 text-[11px] font-bold text-primary-foreground bg-primary h-7 w-7 rounded-full flex items-center justify-center shadow-sm border-2 border-card">{item.step}</span>
              </div>
              <h3 className="text-[18px] font-semibold text-foreground mb-3">{item.title}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[300px] mx-auto">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ TRUST ═══════════ */}
      <section className="bg-card/40 border-y border-border/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[13px] font-semibold text-success uppercase tracking-widest">Безопасность</span>
              <h2 className="text-[1.75rem] md:text-[2.25rem] text-foreground mt-3 mb-6 font-bold tracking-tight">
                Доверие и приватность
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                Каждый профиль проверяется. Данные надёжно защищены. Вы контролируете, кто видит вашу анкету и может писать вам.
              </p>
              <div className="space-y-4">
                {trustPoints.map(point => (
                  <div key={point} className="flex items-center gap-3.5 group">
                    <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0 group-hover:bg-success/15 transition-colors">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-[15px] text-foreground font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(s => (
                <div key={s.label} className="premium-card p-6 text-center">
                  <div className="text-[1.75rem] font-extrabold text-gradient leading-none">{s.value}</div>
                  <div className="text-[12px] text-muted-foreground mt-2 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="gradient-hero rounded-3xl p-12 md:p-20 text-center shadow-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDMwIGggNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAzMCAwIHYgNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-40" />
          <div className="relative">
            <h2 className="text-[1.75rem] md:text-[2.5rem] font-extrabold text-primary-foreground mb-5 tracking-tight leading-tight">
              Начните знакомиться
              <br className="hidden sm:block" />
              прямо сейчас
            </h2>
            <p className="text-primary-foreground/70 mb-10 max-w-lg mx-auto text-[16px] leading-relaxed">
              Тысячи людей уже нашли друзей, компанию и вторую половинку.
              Регистрация бесплатна и занимает 2 минуты.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/auth/register">
                <Button size="lg" variant="secondary" className="h-13 px-10 text-[15px] font-semibold gap-2 rounded-xl shadow-hero">
                  Создать анкету
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SEO CITIES ═══════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-[1.25rem] font-bold text-foreground mb-6 text-center tracking-tight">Знакомства по городам</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {cities.slice(0, 10).map(c => (
            <Link key={c} to={`/dating/${cityToSlug(c)}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-[13px] rounded-xl">
                <MapPin className="h-3.5 w-3.5" />{c}
              </Button>
            </Link>
          ))}
          <Link to="/cities"><Button variant="ghost" size="sm" className="text-[13px]">Все города →</Button></Link>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <Link to="/interests"><Button variant="ghost" size="sm" className="text-[13px]">Знакомства по интересам →</Button></Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border/30 bg-card/30 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">В</span>
              </div>
              <span className="text-[14px] text-muted-foreground">© 2026 ВДрузьях</span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
              <Link to="/cities" className="hover:text-foreground transition-colors">Города</Link>
              <Link to="/interests" className="hover:text-foreground transition-colors">Интересы</Link>
              <a href="#" className="hover:text-foreground transition-colors">Соглашение</a>
              <a href="#" className="hover:text-foreground transition-colors">Конфиденциальность</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
