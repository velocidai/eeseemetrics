"use client";

import { useEffect } from "react";
import { useExtracted } from "next-intl";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useExtracted();

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh text-center space-y-6 p-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t("Something went wrong")}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {t("An unexpected error occurred. Try refreshing the page.")}
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            {t("Error ID: {id}", { id: error.digest })}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={reset} variant="default" size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("Try again")}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            {t("Go to Dashboard")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
