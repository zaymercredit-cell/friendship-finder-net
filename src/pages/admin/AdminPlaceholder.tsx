import { useAdminCheck } from "@/hooks/useAdminCheck";
import { PageSkeleton } from "@/components/ui/content-skeleton";
import { useLocation } from "react-router-dom";

export default function AdminPlaceholder() {
  const { data: isAdmin, isLoading } = useAdminCheck();
  const location = useLocation();
  if (isLoading) return <div className="max-w-7xl mx-auto py-8 px-4"><PageSkeleton /></div>;
  if (!isAdmin) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Доступ запрещён</div>;

  const section = location.pathname.split("/").pop();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-foreground mb-4 capitalize">{section}</h1>
      <p className="text-muted-foreground">Раздел в разработке.</p>
    </div>
  );
}
