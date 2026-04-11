import { useParams, Link } from "react-router-dom";
import { useInviteByCode } from "@/hooks/useInvites";
import { Button } from "@/components/ui/button";
import { Heart, Users, Sparkles } from "lucide-react";

export default function InviteLandingPage() {
  const { code } = useParams<{ code: string }>();
  const { data: invite, isLoading } = useInviteByCode(code);

  // Store invite code for registration
  if (code) {
    localStorage.setItem("vd_invite_code", code);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg">
          <span className="text-2xl font-bold text-primary-foreground">В</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Вас пригласили в ВДрузьях!</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Социальная сеть знакомств и общения. Находите новых друзей, единомышленников и любовь.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[11px] text-muted-foreground">Знакомства</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[11px] text-muted-foreground">Общение</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[11px] text-muted-foreground">AI-подбор</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link to="/auth/register">
            <Button className="w-full h-11">Зарегистрироваться</Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" className="w-full h-11">Уже есть аккаунт? Войти</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
