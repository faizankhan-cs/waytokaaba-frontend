"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTOPLAY_MS = 5000;

/** Cards per slide: 3 on desktop, 2 on tablet, 1 on phones. */
function usePerView() {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () => setPerView(lg.matches ? 3 : sm.matches ? 2 : 1);
    update();
    lg.addEventListener("change", update);
    sm.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      sm.removeEventListener("change", update);
    };
  }, []);
  return perView;
}

/** True when the visitor's system asks for reduced motion (autoplay is then disabled). */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Auto-sliding carousel that shows a fixed number of cards per slide. A short last slide keeps the same
 * card width and is centered. No scrollbar; prev/next arrows sit below the cards.
 */
export function CardCarousel({ items, label }: { items: ReactNode[]; label: string }) {
  const perView = usePerView();
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const pages = useMemo(() => {
    // Every slide is full: a short last slide reuses cards from the previous one (5 cards -> 1-3, then 3-5).
    const chunks: ReactNode[][] = [];
    for (let i = 0; i < items.length; i += perView) {
      const start = Math.max(0, Math.min(i, items.length - perView));
      chunks.push(items.slice(start, start + perView));
    }
    return chunks;
  }, [items, perView]);
  const pageCount = pages.length;
  const current = Math.min(page, Math.max(pageCount - 1, 0));

  const go = useCallback(
    (delta: number) => setPage((p) => (((Math.min(p, pageCount - 1) + delta) % pageCount) + pageCount) % pageCount),
    [pageCount],
  );

  useEffect(() => {
    if (pageCount <= 1 || paused || reducedMotion) return;
    const timer = setInterval(() => {
      if (!document.hidden) go(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [pageCount, paused, reducedMotion, go, current]);

  if (items.length === 0) return null;

  const basis = `calc((100% - ${(perView - 1) * 1.5}rem) / ${perView})`;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="-mx-2 -my-2 overflow-hidden py-2">
        <div
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {pages.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${pageCount}`}
              aria-hidden={index !== current}
              inert={index !== current}
              className="flex w-full shrink-0 justify-center gap-6 px-2"
            >
              {slide.map((item, i) => (
                <div key={i} className="min-w-0 [&>*]:h-full" style={{ flexBasis: basis, maxWidth: basis }}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={`Previous ${label}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-ink-700 shadow-sm transition-colors hover:bg-brand-50"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex items-center gap-1.5" aria-hidden>
            {pages.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all ${index === current ? "w-5 bg-brand-700" : "w-2 bg-sand-200"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={`Next ${label}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-ink-700 shadow-sm transition-colors hover:bg-brand-50"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
