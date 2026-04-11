import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COVER_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_POST_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

interface UseImageUploadOptions {
  bucket: "avatars" | "profile-covers" | "post-images" | "community-covers";
  maxSize?: number;
  onSuccess?: (url: string) => void;
}

export function useImageUpload({ bucket, maxSize, onSuccess }: UseImageUploadOptions) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const effectiveMaxSize = maxSize ?? (bucket === "avatars" ? MAX_AVATAR_SIZE : MAX_COVER_SIZE);

  const validate = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Поддерживаются только JPG, PNG и WebP";
    }
    if (file.size > effectiveMaxSize) {
      const mbLimit = Math.round(effectiveMaxSize / 1024 / 1024);
      return `Файл слишком большой (макс. ${mbLimit} МБ)`;
    }
    return null;
  }, [effectiveMaxSize]);

  const selectFile = useCallback((file: File) => {
    const error = validate(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [validate]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
  }, []);

  const upload = useCallback(async (): Promise<string | null> => {
    if (!selectedFile || !user) {
      toast.error("Нет файла или пользователь не авторизован");
      return null;
    }

    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      toast.success("Изображение загружено!");
      clearSelection();
      onSuccess?.(publicUrl);
      return publicUrl;
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Ошибка загрузки");
      return null;
    } finally {
      setUploading(false);
    }
  }, [selectedFile, user, bucket, clearSelection, onSuccess]);

  return {
    uploading,
    preview,
    selectedFile,
    selectFile,
    clearSelection,
    upload,
    validate,
  };
}
