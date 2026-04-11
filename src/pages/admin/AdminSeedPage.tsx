import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminSeedPage() {
  const [running, setRunning] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(10);
  const [results, setResults] = useState<any[]>([]);

  const runSeed = async (batches: number) => {
    setRunning(true);
    setTotalBatches(batches);
    setResults([]);

    for (let i = 0; i < batches; i++) {
      setCurrentBatch(i + 1);
      try {
        const { data, error } = await supabase.functions.invoke("seed-demo-data", {
          body: { batch: i, totalBatches: batches },
        });
        if (error) throw error;
        setResults(prev => [...prev, { batch: i, ...data }]);
      } catch (err: any) {
        setResults(prev => [...prev, { batch: i, error: err.message }]);
        toast.error(`Ошибка в батче ${i}: ${err.message}`);
      }
    }

    setRunning(false);
    toast.success("Генерация данных завершена!");
  };

  const totalUsers = results.reduce((s, r) => s + (r.users_created || 0), 0);
  const totalPosts = results.reduce((s, r) => s + (r.posts_created || 0), 0);
  const totalLikes = results.reduce((s, r) => s + (r.likes_created || 0), 0);
  const totalViews = results.reduce((s, r) => s + (r.views_created || 0), 0);
  const totalMessages = results.reduce((s, r) => s + (r.messages_created || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Генерация демо-данных</h1>
      <p className="text-sm text-muted-foreground">
        Создаёт реалистичных пользователей, посты, лайки, сообщения, события и сообщества. 
        Каждый батч = ~50 пользователей + 100 постов + 200 лайков + 300 просмотров.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <Button onClick={() => runSeed(4)} disabled={running} className="gap-2">
          <Database className="h-4 w-4" />200 юзеров
        </Button>
        <Button onClick={() => runSeed(10)} disabled={running} className="gap-2">
          <Database className="h-4 w-4" />500 юзеров
        </Button>
        <Button onClick={() => runSeed(20)} disabled={running} variant="secondary" className="gap-2">
          <Database className="h-4 w-4" />1000 юзеров
        </Button>
      </div>

      {running && (
        <div className="bg-card rounded-xl border border-border/60 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Батч {currentBatch} из {totalBatches}</span>
          </div>
          <Progress value={(currentBatch / totalBatches) * 100} />
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-card rounded-xl border border-border/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Результаты</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-2 rounded-lg bg-secondary/40">
              <p className="text-lg font-bold text-foreground">{totalUsers}</p>
              <p className="text-[10px] text-muted-foreground">пользователей</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/40">
              <p className="text-lg font-bold text-foreground">{totalPosts}</p>
              <p className="text-[10px] text-muted-foreground">постов</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/40">
              <p className="text-lg font-bold text-foreground">{totalLikes}</p>
              <p className="text-[10px] text-muted-foreground">лайков</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/40">
              <p className="text-lg font-bold text-foreground">{totalViews}</p>
              <p className="text-[10px] text-muted-foreground">просмотров</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/40">
              <p className="text-lg font-bold text-foreground">{totalMessages}</p>
              <p className="text-[10px] text-muted-foreground">сообщений</p>
            </div>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {r.error ? <AlertCircle className="h-3 w-3 text-destructive" /> : <CheckCircle className="h-3 w-3 text-success" />}
                Батч {r.batch}: {r.error || `${r.users_created} юзеров, ${r.posts_created} постов`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
