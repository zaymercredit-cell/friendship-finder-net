import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const { signUp, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Ошибка", description: "Пароль должен быть минимум 6 символов" });
      return;
    }
    setLoading(true);
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now().toString(36)}`;
    const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName, username });
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Ошибка регистрации", description: error.message });
    } else {
      // Handle invite code bonus
      const inviteCode = localStorage.getItem("vd_invite_code");
      if (inviteCode) {
        localStorage.removeItem("vd_invite_code");
        // Increment invite uses (best effort)
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
          <h1 className="text-2xl font-bold text-foreground">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground mt-1">Присоединяйся к ВДрузьях</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border shadow-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Имя</Label>
              <Input placeholder="Алексей" className="mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Фамилия</Label>
              <Input placeholder="Иванов" className="mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" placeholder="example@mail.ru" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Пароль</Label>
            <Input type="password" placeholder="Минимум 6 символов" className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button className="w-full h-10" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
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
