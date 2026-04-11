import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Heart, Download, ZoomIn } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PhotoGalleryLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (index: number) => void;
}

export default function PhotoGalleryLightbox({
  images,
  currentIndex,
  open,
  onOpenChange,
  onNavigate,
}: PhotoGalleryLightboxProps) {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [zoomed, setZoomed] = useState(false);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goNext = useCallback(() => hasNext && onNavigate(currentIndex + 1), [hasNext, currentIndex, onNavigate]);
  const goPrev = useCallback(() => hasPrev && onNavigate(currentIndex - 1), [hasPrev, currentIndex, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev, onOpenChange]);

  const toggleLike = () => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 bg-foreground/95 backdrop-blur-xl border-none gap-0 [&>button]:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[13px] text-primary-foreground/70 font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={toggleLike}
            >
              <Heart className={cn("h-5 w-5", liked.has(currentIndex) && "fill-destructive text-destructive")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setZoomed(!zoomed)}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image area */}
        <div className="relative flex items-center justify-center min-h-[50vh] md:min-h-[65vh] px-12 pb-4 select-none">
          {hasPrev && (
            <button
              className="absolute left-2 z-10 h-12 w-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              onClick={goPrev}
            >
              <ChevronLeft className="h-6 w-6 text-primary-foreground" />
            </button>
          )}

          <img
            src={images[currentIndex]}
            alt=""
            className={cn(
              "max-h-[75vh] max-w-full object-contain rounded-lg transition-transform duration-300",
              zoomed && "scale-150 cursor-zoom-out"
            )}
            onClick={() => zoomed && setZoomed(false)}
            draggable={false}
          />

          {hasNext && (
            <button
              className="absolute right-2 z-10 h-12 w-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              onClick={goNext}
            >
              <ChevronRight className="h-6 w-6 text-primary-foreground" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={cn(
                  "h-14 w-14 rounded-lg overflow-hidden shrink-0 ring-2 transition-all",
                  i === currentIndex ? "ring-primary opacity-100" : "ring-transparent opacity-50 hover:opacity-80"
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
