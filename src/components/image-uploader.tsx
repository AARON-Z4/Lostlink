/**
 * src/components/image-uploader.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Drag-and-drop image uploader with preview, progress bar, and clear button.
 * Backed by useImageUpload hook.
 *
 * Usage:
 *   <ImageUploader onUploaded={(url) => setValue("image", url)} />
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUploaded?: (url: string) => void;
  onFileSelected?: (file: File) => void;  // called with raw File before upload
  className?: string;
  maxSizeMB?: number;
}

export function ImageUploader({ onUploaded, onFileSelected, className, maxSizeMB = 10 }: ImageUploaderProps) {
  const { preview, progress, uploading, inputRef, openPicker, handleDrop, handleInputChange, clear } =
    useImageUpload({ maxSizeMB, onUploaded, onFileSelected });

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image — click or drag and drop"
        onClick={openPicker}
        onKeyDown={(e) => e.key === "Enter" && openPicker()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3",
          "rounded-xl border-2 border-dashed border-border transition-colors",
          "hover:border-accent hover:bg-accent/5",
          preview && "border-solid border-border/50 p-0 overflow-hidden",
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Upload preview"
              className="h-full max-h-72 w-full rounded-xl object-cover"
            />
            {/* Clear button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              aria-label="Remove image"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drop an image here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse — up to {maxSizeMB} MB</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="pointer-events-none">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Select image
            </Button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {/* Progress bar (only shown during real upload) */}
      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-right text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
}
