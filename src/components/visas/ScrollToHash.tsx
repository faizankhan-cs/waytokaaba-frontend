"use client";

import { useEffect } from "react";

/**
 * The visa detail sections stream in after navigation, so the browser has nothing to scroll to when it handles
 * `#requirements`. Rendered inside the target section, this scrolls to it once it actually exists.
 */
export function ScrollToHash({ id }: { id: string }) {
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [id]);
  return null;
}
