import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { signIn, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && session) {
      navigate("/feed", { replace: true });
    }
  }, [session, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Ошибка входа", description: error.message });
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">В</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Вход в ВДрузьях</h1>
          <p className="text-sm text-muted-foreground mt-1">Добро пожаловать обратно!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border shadow-card p-6 space-y-4">
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              placeholder="example@mail.ru"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="text-xs">Пароль</Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full h-10" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Нет аккаунта?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">Зарегистрироваться</Link>
          </p>
        </form>

        <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">🔧 Dev-вход:</p>
          <p>Email: <button type="button" className="font-mono text-primary cursor-pointer hover:underline" onClick={() => { setEmail("info@vdruzyah.local"); setPassword("admin"); }}>info@vdruzyah.local</button></p>
          <p>Пароль: <span className="font-mono">admin</span></p>
        </div>
      </div>
    </div>
  );
}
