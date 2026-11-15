"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImageAction } from "@/app/admin/actions";

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

/** Uploads one file through the server action and returns its URL or an error message. */
export async function uploadPhoto(file: File): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    return await uploadImageAction(fd);
  } catch {
    return { error: "Upload failed. Please try again." };
  }
}

/**
 * One photo field: "Choose photo" button, live preview and upload progress. The uploaded photo's URL is kept in a
 * hidden input called `name`, so forms submit a URL exactly as before.
 */
export function ImageUpload({
  name,
  label,
  defaultValue,
  required,
  error,
  id,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
  error?: string;
  id?: string;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(undefined);
    const result = await uploadPhoto(file);
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    if (result.url) setUrl(result.url);
    else setUploadError(result.error);
  }

  const message = uploadError ?? error;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="label">{label}</label>
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileInput}
        id={inputId}
        type="file"
        accept={PHOTO_ACCEPT}
        className="sr-only"
        aria-invalid={message ? true : undefined}
        aria-describedby={`${inputId}-hint`}
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative aspect-[16/10] w-48 overflow-hidden rounded-lg border border-dashed border-sand-200 bg-sand-100">
          {url ? (
            <Image src={url} alt="Selected photo" fill sizes="192px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-ink-500">No photo yet</span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden />
              <span className="sr-only">Uploading…</span>
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" className="btn-outline px-3 py-2" disabled={uploading} onClick={() => fileInput.current?.click()}>
            <ImagePlus className="h-4 w-4" aria-hidden /> {uploading ? "Uploading…" : url ? "Replace photo" : "Choose photo"}
          </button>
          {url && !required && !uploading && (
            <button type="button" className="btn-ghost px-3 py-1.5 text-sm text-red-700" onClick={() => setUrl("")}>
              <X className="h-4 w-4" aria-hidden /> Remove photo
            </button>
          )}
        </div>
      </div>
      <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-500">JPG, PNG or WebP, up to 10 MB. Large photos are resized automatically.</p>
      {message && <p className="field-error" role="alert">{message}</p>}
    </div>
  );
}
