import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useLocation } from "react-router-dom";

export default function AdminPlaceholder() {
  const { data: isAdmin, isLoading } = useAdminCheck();
  const location = useLocation();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Доступ запрещён</div>;

  const section = location.pathname.split("/").pop();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-foreground mb-4 capitalize">{section}</h1>
      <p className="text-muted-foreground">Раздел в разработке.</p>
    </div>
  );
}
