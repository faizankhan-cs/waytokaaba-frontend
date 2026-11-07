/** Minimal brand glyphs (the icon library does not ship brand logos). */

export function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M14 8h2.5V4.5H14c-2.6 0-4 1.7-4 4.3V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" />
      <path
        d="M9.2 8.3c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.4.7 1 1.4 1.7 1.9.4.3.7.4 1 .6.2.1.4 0 .5-.1l.6-.7c.1-.2.3-.2.5-.1l1.6.7c.2.1.4.2.4.4 0 .5-.1 1.1-.5 1.5-.4.4-1.2.8-2 .7-1-.1-2.6-.7-4-2-1.4-1.3-2.2-2.8-2.4-3.8-.2-.9.1-1.7.6-2.3z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
