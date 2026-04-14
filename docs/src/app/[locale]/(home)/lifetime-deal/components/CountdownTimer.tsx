"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculate(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculate(endDate));
    const id = setInterval(() => setTimeLeft(calculate(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  // Prevent hydration mismatch — render placeholder until client mounts
  if (!mounted) {
    return <div className="h-16" aria-hidden />;
  }

  if (!timeLeft) {
    return (
      <p className="text-neutral-400 text-sm font-medium">
        This deal has ended.
      </p>
    );
  }

  const units = [
    { value: timeLeft.days, label: "days" },
    { value: timeLeft.hours, label: "hrs" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className="flex items-end gap-2 sm:gap-4" aria-label="Time remaining">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-end gap-2 sm:gap-4">
          <div className="flex flex-col items-center min-w-[2.5rem]">
            <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white leading-none">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs text-neutral-400 mt-1.5 uppercase tracking-wider">
              {label}
            </span>
          </div>
          {i < 3 && (
            <span className="text-neutral-500 text-2xl font-bold mb-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
