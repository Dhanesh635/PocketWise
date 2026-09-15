"use client";

import { useEffect, useState } from "react";

type AutoDismissToastProps = Readonly<{
  message: string;
  durationMs?: number;
  className?: string;
}>;

export function AutoDismissToast({
  message,
  durationMs = 2800,
  className = "",
}: AutoDismissToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(false), durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [durationMs, message]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 z-40 min-h-11 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-brand-primary/40 bg-white px-4 py-3 text-sm text-slate-700 shadow-card-hover ${className}`}
    >
      {message}
    </div>
  );
}
