import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: string | null;
  uploading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

export default function ImagePreviewDialog({
  open,
  onOpenChange,
  preview,
  uploading,
  onConfirm,
  onCancel,
  title = "Предпросмотр",
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {preview && (
          <div className="flex items-center justify-center">
            <img
              src={preview}
              alt="Preview"
              className="max-h-80 rounded-lg object-contain"
            />
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={uploading}>
            Отмена
          </Button>
          <Button onClick={onConfirm} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Загрузка…
              </>
            ) : (
              "Сохранить"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
