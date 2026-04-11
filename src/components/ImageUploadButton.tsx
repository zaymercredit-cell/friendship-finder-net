import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export default function ImageUploadButton({
  onFileSelect,
  accept = "image/jpeg,image/png,image/webp",
  children,
  className,
  variant = "secondary",
  size = "sm",
  disabled = false,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
