import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { reportReasons, useSubmitReport } from "@/hooks/useReports";
import { Flag } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reportedUserId: string;
  reportedName?: string;
}

export default function ReportDialog({ open, onOpenChange, reportedUserId, reportedName }: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const submit = useSubmitReport();

  const handleSubmit = async () => {
    if (!reason) return;
    await submit.mutateAsync({ reportedUserId, reason, description });
    setReason("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Пожаловаться{reportedName ? ` на ${reportedName}` : ""}
          </DialogTitle>
          <DialogDescription>Выберите причину жалобы. Мы рассмотрим её в кратчайшие сроки.</DialogDescription>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
          {reportReasons.map((r) => (
            <div key={r.value} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
              <RadioGroupItem value={r.value} id={r.value} />
              <Label htmlFor={r.value} className="cursor-pointer text-sm font-medium">{r.label}</Label>
            </div>
          ))}
        </RadioGroup>

        <div>
          <Label className="text-xs text-muted-foreground">Дополнительное описание (необязательно)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder="Опишите ситуацию..."
            className="mt-1 resize-none"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!reason || submit.isPending}>
            {submit.isPending ? "Отправка..." : "Отправить жалобу"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
