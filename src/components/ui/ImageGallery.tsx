"use client";

import Image from "next/image";
import { useState } from "react";

export interface GalleryImage {
  url: string;
  caption?: string | null;
}

export function ImageGallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand-100">
        <Image
          key={current.url}
          src={current.url}
          alt={current.caption ?? alt}
          fill
          preload={active === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Gallery thumbnails">
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-sand-100 ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-brand-600"
              >
                <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
