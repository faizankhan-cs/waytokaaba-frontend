"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Image loader for next/image.
 * - Unsplash (imgix) URLs get responsive width/quality parameters, so the CDN resizes them.
 * - Other absolute URLs are passed through unchanged (with a width hint fragment so srcset entries stay unique).
 * - Local /public assets are returned as-is.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith("/")) return src;

  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality ?? 75));
      url.searchParams.set("auto", "format");
      if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
      return url.toString();
    }
    url.hash = `w=${width}`;
    return url.toString();
  } catch {
    return src;
  }
}
