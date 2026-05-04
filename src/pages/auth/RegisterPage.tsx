import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { signUp, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && session) navigate("/feed", { replace: true });
  }, [session, authLoading, navigate]);

  if (authLoading || session) return null;

  const validate = () => {
    const e: typeof errors = {};
    if (firstName.trim().length < 2) e.firstName = "Минимум 2 символа";
    if (lastName.trim().length < 2) e.lastName = "Минимум 2 символа";
    if (!emailRe.test(email.trim())) e.email = "Введите корректный email";
    if (password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now().toString(36)}`;
    const { error } = await signUp(email.trim(), password, { first_name: firstName.trim(), last_name: lastName.trim(), username });
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Ошибка регистрации", description: error.message });
      return;
    }
    const inviteCode = localStorage.getItem("vd_invite_code");
    if (inviteCode) {
      localStorage.removeItem("vd_invite_code");
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: inv } = await supabase.from("invites" as any).select("*").eq("invite_code", inviteCode).limit(1);
        if (inv && inv.length > 0) {
          await supabase.from("invites" as any).update({ uses: ((inv[0] as any).uses || 0) + 1 }).eq("id", (inv[0] as any).id);
        }
      } catch {}
    }
    toast({ title: "Регистрация успешна!", description: "Проверьте email для подтверждения аккаунта." });
    navigate("/onboarding");
  };

  const clear = (k: string) => setErrors((p) => ({ ...p, [k]: undefined }));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">В</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground mt-1">Присоединяйся к ВДрузьях</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-card rounded-2xl border border-border/60 shadow-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fn" className="text-xs">Имя</Label>
              <Input id="fn" placeholder="Алексей" aria-invalid={!!errors.firstName} value={firstName} onChange={(e) => { setFirstName(e.target.value); clear("firstName"); }} required />
              {errors.firstName && <p className="text-xs text-destructive animate-fade-in">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ln" className="text-xs">Фамилия</Label>
              <Input id="ln" placeholder="Иванов" aria-invalid={!!errors.lastName} value={lastName} onChange={(e) => { setLastName(e.target.value); clear("lastName"); }} required />
              {errors.lastName && <p className="text-xs text-destructive animate-fade-in">{errors.lastName}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="em" className="text-xs">Email</Label>
            <Input id="em" type="email" autoComplete="email" placeholder="example@mail.ru" aria-invalid={!!errors.email} value={email} onChange={(e) => { setEmail(e.target.value); clear("email"); }} required />
            {errors.email && <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw" className="text-xs">Пароль</Label>
            <Input id="pw" type="password" autoComplete="new-password" placeholder="Минимум 6 символов" aria-invalid={!!errors.password} value={password} onChange={(e) => { setPassword(e.target.value); clear("password"); }} required />
            {errors.password && <p className="text-xs text-destructive animate-fade-in">{errors.password}</p>}
          </div>
          <Button className="w-full h-10" disabled={loading}>
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Регистрация...</>) : "Зарегистрироваться"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
