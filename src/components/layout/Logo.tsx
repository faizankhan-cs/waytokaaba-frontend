import Image from "next/image";
import Link from "next/link";

/** Way To Kaaba emblem (gold hexagon with the Kaaba). Transparent PNG, aspect ratio 427:512. */
export function LogoMark({ className = "h-10 w-auto", preload = false }: { className?: string; preload?: boolean }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={427}
      height={512}
      preload={preload}
      unoptimized
      className={className}
    />
  );
}

/** Emblem + wordmark, matching the official "WAY TO KAABA · TRAVEL & TOURS" logo. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Way To Kaaba Travel & Tours — home">
      <LogoMark className="h-11 w-auto" preload />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.35rem] tracking-wide uppercase ${light ? "text-white" : "text-ink-900"}`}>
          Way To Kaaba
        </span>
        <span className={`mt-1 text-[0.6rem] font-semibold tracking-[0.32em] uppercase ${light ? "text-gold-400" : "text-gold-600"}`}>
          Travel &amp; Tours
        </span>
      </span>
    </Link>
  );
}
