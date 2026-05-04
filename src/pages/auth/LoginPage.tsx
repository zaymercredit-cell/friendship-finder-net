import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock } from "lucide-react";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { signIn, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && session) navigate("/feed", { replace: true });
  }, [session, authLoading, navigate]);

  if (authLoading || session) return null;

  const validate = () => {
    const e: typeof errors = {};
    if (!emailRe.test(email.trim())) e.email = "Введите корректный email";
    if (password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) toast({ variant: "destructive", title: "Ошибка входа", description: error.message });
    else navigate("/feed");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">В</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Вход в ВДрузьях</h1>
          <p className="text-sm text-muted-foreground mt-1">Добро пожаловать обратно!</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-card rounded-2xl border border-border/60 shadow-card p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@mail.ru"
                className="pl-9"
                aria-invalid={!!errors.email}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                required
              />
            </div>
            {errors.email && <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9"
                aria-invalid={!!errors.password}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                required
              />
            </div>
            {errors.password && <p className="text-xs text-destructive animate-fade-in">{errors.password}</p>}
          </div>
          <Button className="w-full h-10" disabled={loading}>
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Вход...</>) : "Войти"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Нет аккаунта?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">Зарегистрироваться</Link>
          </p>
        </form>

        <div className="bg-muted/50 border border-border/60 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">🔧 Dev-вход:</p>
          <p>Email: <button type="button" className="font-mono text-primary cursor-pointer hover:underline" onClick={() => { setEmail("info@vdruzyah.local"); setPassword("admin"); setErrors({}); }}>info@vdruzyah.local</button></p>
          <p>Пароль: <span className="font-mono">admin</span></p>
        </div>
      </div>
    </div>
  );
}
