import { useState, useRef, useEffect, memo, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  /** Eager load (e.g. above-the-fold hero). Default: lazy via IntersectionObserver. */
  priority?: boolean;
  /** Aspect-ratio container class (e.g. "aspect-[3/4]"). When provided, prevents CLS. */
  aspectClass?: string;
  /** Wrapper class (applied to the placeholder container). */
  wrapperClassName?: string;
}

/**
 * Performance-optimized image:
 *  - native lazy + async decoding
 *  - shimmer placeholder (no extra network) — eliminates CLS & blank flashes
 *  - IntersectionObserver gating: src is only set once near viewport (saves
 *    bandwidth on long lists like Discover / Friends / Search)
 *  - graceful fallback on error
 *
 * Usage:
 *   <SmartImage src={user.avatar} alt={user.name} aspectClass="aspect-[3/4]" className="object-cover" />
 */
const SmartImage = memo(function SmartImage({
  src,
  alt,
  priority = false,
  aspectClass,
  wrapperClassName,
  className,
  onLoad,
  onError,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [inView, setInView] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || inView) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" } // start fetching 300px before entering viewport
    );
    io.observe(node);
    return () => io.disconnect();
  }, [priority, inView]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-muted/40",
        aspectClass,
        wrapperClassName
      )}
    >
      {/* Shimmer placeholder — pure CSS, no JS. */}
      {!loaded && !errored && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]"
          style={{ animationName: "shimmer" }}
        />
      )}
      {inView && src && !errored && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...({ fetchpriority: priority ? "high" : "auto" } as any)}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setErrored(true);
            onError?.(e);
          }}
          className={cn(
            "h-full w-full transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...rest}
        />
      )}
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-xs">
          {alt?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
});

export default SmartImage;
