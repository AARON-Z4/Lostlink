/**
 * src/hooks/useImageUpload.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable image-upload hook with:
 *  • Local preview (URL.createObjectURL)
 *  • Drag-and-drop + click-to-select
 *  • Progress tracking
 *  • Validates type (image/*) and size (default 10 MB)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/services/upload.service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

interface UseImageUploadOptions {
  maxSizeMB?: number;
  bucket?: string;
  /** Called with the final public URL after successful upload */
  onUploaded?: (url: string) => void;
  /** Called immediately with the raw File when selected (before upload) */
  onFileSelected?: (file: File) => void;
}

interface UseImageUploadReturn {
  file: File | null;
  preview: string | null;
  progress: number;
  uploading: boolean;
  uploadedUrl: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  openPicker: () => void;
  handleFile: (file: File) => Promise<void>;
  handleDrop: (e: React.DragEvent<HTMLElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clear: () => void;
}

export function useImageUpload({
  maxSizeMB = 10,
  bucket = "items",
  onUploaded,
  onFileSelected,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setProgress(0);
    setUploading(false);
    setUploadedUrl(null);
  }, [preview]);

  const handleFile = useCallback(
    async (selected: File) => {
      // Validate type
      if (!selected.type.startsWith("image/")) {
        toast.error("Only image files are accepted.");
        return;
      }
      // Validate size
      if (selected.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image must be smaller than ${maxSizeMB} MB.`);
        return;
      }

      // Build preview immediately
      const objectUrl = URL.createObjectURL(selected);
      setFile(selected);
      setPreview(objectUrl);
      setProgress(0);
      setUploadedUrl(null);
      onFileSelected?.(selected);  // notify parent with raw File

      // In mock mode, skip the real upload
      if (USE_MOCK) {
        setUploadedUrl(objectUrl);
        onUploaded?.(objectUrl);
        return;
      }

      // Upload to backend
      setUploading(true);
      try {
        const { url } = await uploadFile(selected, bucket, setProgress);
        setUploadedUrl(url);
        onUploaded?.(url);
        toast.success("Image uploaded successfully.");
      } catch {
        toast.error("Upload failed — please try again.");
        setProgress(0);
      } finally {
        setUploading(false);
      }
    },
    [bucket, maxSizeMB, onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
      // reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  return {
    file,
    preview,
    progress,
    uploading,
    uploadedUrl,
    inputRef,
    openPicker,
    handleFile,
    handleDrop,
    handleInputChange,
    clear,
  };
}
