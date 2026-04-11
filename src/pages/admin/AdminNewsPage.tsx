import { useState } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminNewsList, useCreateNews, useUpdateNews, usePublishNews, generateSlug, NewsArticle } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus, Edit, Send, AlertTriangle, Filter } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

const CATEGORIES = ["city","incidents","business","sport","culture","society"];
const STATUSES = [
  { key: "all", label: "Все" },
  { key: "draft", label: "Черновики" },
  { key: "published", label: "Опубликованные" },
  { key: "queue", label: "Очередь" },
];

function NewsForm({ article, onClose }: { article?: NewsArticle; onClose: () => void }) {
  const create = useCreateNews();
  const update = useUpdateNews();
  const [form, setForm] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    cover_image: article?.cover_image || "",
    category: article?.category || "city",
    tags: article?.tags?.join(", ") || "",
    source: article?.source || "",
    source_url: article?.source_url || "",
    city: article?.city || "",
    seo_title: article?.seo_title || "",
    seo_description: article?.seo_description || "",
    status: article?.status || "draft",
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        cover_image: form.cover_image || null,
      };
      if (article) {
        await update.mutateAsync({ id: article.id, ...payload });
        toast.success("Новость обновлена");
      } else {
        await create.mutateAsync(payload as any);
        toast.success("Новость создана");
      }
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input placeholder="Заголовок" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
      <Input placeholder="Краткое описание (excerpt)" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} />
      <Textarea placeholder="Полный текст" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={8} />
      <Input placeholder="URL обложки" value={form.cover_image} onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Черновик</SelectItem>
            <SelectItem value="queue">Очередь</SelectItem>
            <SelectItem value="published">Опубликовано</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input placeholder="Теги через запятую" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Источник" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
        <Input placeholder="URL источника" value={form.source_url} onChange={e => setForm(p => ({ ...p, source_url: e.target.value }))} />
      </div>
      <Input placeholder="Город" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
      <Input placeholder="SEO заголовок" value={form.seo_title} onChange={e => setForm(p => ({ ...p, seo_title: e.target.value }))} />
      <Input placeholder="SEO описание" value={form.seo_description} onChange={e => setForm(p => ({ ...p, seo_description: e.target.value }))} />
      <Button onClick={handleSubmit} disabled={create.isPending || update.isPending} className="w-full">
        {article ? "Обновить" : "Создать"}
      </Button>
    </div>
  );
}

export default function AdminNewsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [editing, setEditing] = useState<NewsArticle | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const publish = usePublishNews();

  const { data: articles = [], isLoading } = useAdminNewsList(statusFilter === "all" ? undefined : statusFilter);

  const filtered = catFilter === "all" ? articles : articles.filter(a => a.category === catFilter);

  if (adminLoading) return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Доступ запрещён</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Управление новостями</h1>
        </div>
        <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Создать</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Редактировать" : "Новая новость"}</DialogTitle></DialogHeader>
            <NewsForm article={editing} onClose={() => { setShowForm(false); setEditing(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {s.label}
          </button>
        ))}
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-36 h-8"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-28">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <div className="flex items-center gap-1">
                      {a.is_duplicate && <span title="Возможный дубль"><AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" /></span>}
                      {a.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{a.slug}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{a.category}</Badge></TableCell>
                  <TableCell className="text-sm">{a.city || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "published" ? "default" : "outline"} className="text-xs">
                      {a.status === "draft" ? "Черновик" : a.status === "published" ? "Опубликовано" : "Очередь"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {a.published_at ? format(new Date(a.published_at), "dd.MM.yy HH:mm") : format(new Date(a.created_at), "dd.MM.yy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(a); setShowForm(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {a.status !== "published" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => publish.mutateAsync(a.id).then(() => toast.success("Опубликовано"))}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Нет новостей</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
