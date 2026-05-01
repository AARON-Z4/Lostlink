/**
 * src/services/upload.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone file-upload helper.
 * Sends a single image to POST /upload → backend streams it to Supabase Storage.
 * Returns the public CDN URL to embed in item records.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { axiosClient } from "@/lib/axios";

export interface UploadResponse {
  url: string;      // public Supabase Storage URL
  path: string;     // internal Supabase bucket path
}

/**
 * Upload a single File/Blob to the backend.
 * @param file     The File or Blob to upload
 * @param bucket   Optional storage bucket hint (e.g. "items")
 * @param onProgress Optional upload progress callback (0–100)
 */
export async function uploadFile(
  file: File,
  bucket = "items",
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("bucket", bucket);

  const { data } = await axiosClient.post<UploadResponse>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });

  return data;
}
