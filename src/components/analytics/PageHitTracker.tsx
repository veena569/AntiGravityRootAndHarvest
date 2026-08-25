"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageHitTracker() {
  const pathname = usePathname();
  const lastRecordedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Prevent duplicate logs on same page reload within component re-renders
    if (lastRecordedPath.current === pathname) return;
    lastRecordedPath.current = pathname;

    // Send async pageview hit ping
    try {
      fetch("/api/analytics/hit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => {
        // Silently ignore tracking errors to not interrupt client experience
      });
    } catch (err) {
      // Ignore
    }
  }, [pathname]);

  return null;
}
