"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "ltd-banner-dismissed";

export function LtdBanner({ endDate, slotsLeft }: { endDate: string; slotsLeft: number }) {
  const [visible, setVisible] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    // Don't show if dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);

    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setVisible(false); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      if (d > 0) setTimeStr(`${d}d ${h}h left`);
      else if (h > 0) setTimeStr(`${h}h ${m}m left`);
      else setTimeStr(`${m}m left`);
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 sm:gap-3 text-center px-8 py-2 bg-[#26B0A2] dark:bg-[#26B0A2] text-white text-xs sm:text-sm">
      <span className="font-semibold">⚡ Lifetime Deal:</span>
      <span>
        Get eesee metrics forever from{" "}
        <span className="font-bold">$49 one-time.</span>
      </span>
      {slotsLeft > 0 && (
        <span className="hidden sm:inline opacity-90">
          Only {slotsLeft} slots left.
        </span>
      )}
      {timeStr && (
        <span className="font-mono font-semibold opacity-90">{timeStr}</span>
      )}
      <Link
        href="/lifetime-deal"
        className="font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
      >
        See the deal →
      </Link>

      <button
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
