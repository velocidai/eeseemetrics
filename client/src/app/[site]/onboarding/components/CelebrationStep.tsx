"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CelebrationStepProps {
  siteId: string;
}

export function CelebrationStep({ siteId }: CelebrationStepProps) {
  const router = useRouter();

  useEffect(() => {
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#ffffff"],
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <span className="text-6xl select-none">🎉</span>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Your first visitor just arrived!
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
          Analytics tracking is live. Head to your dashboard to see sessions,
          pages, referrers, and more in real time.
        </p>
      </div>
      <Button
        onClick={() => router.push(`/${siteId}`)}
        className="bg-accent-600 hover:bg-accent-500 text-white h-11 px-6"
      >
        Go to your dashboard →
      </Button>
    </div>
  );
}
