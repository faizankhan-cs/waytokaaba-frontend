"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { PHOTO_ACCEPT, uploadPhoto } from "./ImageUpload";

const MAX_PHOTOS = 20;

/**
 * Gallery field: add several photos at once, reorder or remove them. The URLs are kept in a hidden input called
 * `name`, one per line, which is the format the server actions already read.
 */
export function GalleryUpload({
  name = "images",
  label,
  defaultUrls = [],
  error,
}: {
  name?: string;
  label: string;
  defaultUrls?: string[];
  error?: string;
}) {
  const inputId = `${name}-${useId()}`;
  const fileInput = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [pending, setPending] = useState(0);
  const [uploadError, setUploadError] = useState<string>();

  async function onFiles(list: FileList | null) {
    const files = Array.from(list ?? []).slice(0, Math.max(0, MAX_PHOTOS - urls.length));
    if (fileInput.current) fileInput.current.value = "";
    if (files.length === 0) {
      if (list?.length) setUploadError(`A gallery can have at most ${MAX_PHOTOS} photos.`);
      return;
    }
    setUploadError(undefined);
    setPending(files.length);
    for (const file of files) {
      const result = await uploadPhoto(file);
      if (result.url) setUrls((u) => [...u, result.url!]);
      else setUploadError(`${file.name}: ${result.error}`);
      setPending((p) => p - 1);
    }
  }

  const move = (i: number, by: -1 | 1) =>
    setUrls((u) => {
      const next = [...u];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });

  const message = uploadError ?? error;

  return (
    <div>
      <label htmlFor={inputId} className="label">{label}</label>
      <input type="hidden" name={name} value={urls.join("\n")} />
      <input
        ref={fileInput}
        id={inputId}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => onFiles(e.target.files)}
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={`${label} (${urls.length})`}>
        {urls.map((url, i) => (
          <li key={url} className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
            <Image src={url} alt={`Gallery photo ${i + 1}`} fill sizes="200px" className="object-cover" />
            <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 text-xs font-semibold text-white">{i + 1}</span>
            <div className="absolute inset-x-1 bottom-1 flex justify-between">
              <span className="flex gap-1">
                <button type="button" className="rounded bg-white/90 p-1 shadow disabled:opacity-40" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move photo ${i + 1} left`}>
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" className="rounded bg-white/90 p-1 shadow disabled:opacity-40" disabled={i === urls.length - 1} onClick={() => move(i, 1)} aria-label={`Move photo ${i + 1} right`}>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </span>
              <button type="button" className="rounded bg-white/90 p-1 text-red-700 shadow" onClick={() => setUrls((u) => u.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: pending }, (_, i) => (
          <li key={`pending-${i}`} className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-sand-200 bg-sand-100" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden />
            <span className="sr-only">Uploading…</span>
          </li>
        ))}
        {urls.length + pending < MAX_PHOTOS && (
          <li>
            <button
              type="button"
              className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-sand-200 text-sm text-ink-500 hover:border-gold-500 hover:text-ink-900 disabled:opacity-60"
              disabled={pending > 0}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus className="h-5 w-5" aria-hidden /> Add photos
            </button>
          </li>
        )}
      </ul>
      <p className="mt-1.5 text-xs text-ink-500">You can pick several photos at once. Use the arrows to change the order; the first photos show first.</p>
      {message && <p className="field-error" role="alert">{message}</p>}
    </div>
  );
}
