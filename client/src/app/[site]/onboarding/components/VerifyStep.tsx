"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSiteHasData } from "@/api/admin/endpoints/sites";

interface VerifyStepProps {
  siteId: string;
  onSuccess: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const POLL_INTERVAL_MS = 3_000;
const TIMEOUT_MS = 10 * 60 * 1_000; // 10 minutes

export function VerifyStep({ siteId, onSuccess, onSkip, onBack }: VerifyStepProps) {
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const { hasData } = await fetchSiteHasData(siteId);
        if (hasData) {
          clearInterval(intervalRef.current!);
          clearTimeout(timeoutRef.current!);
          onSuccessRef.current();
        }
      } catch {
        // ignore transient errors — keep polling
      }
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setTimedOut(true);
    }, TIMEOUT_MS);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [siteId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Verify installation</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Visit your site in a new tab. We'll detect your first event automatically.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 py-10 text-center">
        {!timedOut ? (
          <>
            <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Waiting for your first visitor…
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Checking every 3 seconds.
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="text-5xl">⏱️</span>
            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Still waiting?
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Make sure the snippet is deployed and your site is publicly accessible.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <button
          onClick={onSkip}
          className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
