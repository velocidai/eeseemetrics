"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authClient } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/const";

function LtdCheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = params.get("tier") ?? "1";
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: orgPending } = authClient.useActiveOrganization();
  const [error, setError] = useState<string | null>(null);

  const isPending = sessionPending || orgPending;

  useEffect(() => {
    if (isPending) return;

    // Not logged in — redirect to login then return here
    if (!session?.user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/ltd?tier=${tier}`)}`);
      return;
    }

    const parsedTier = parseInt(tier, 10);
    if (![1, 2, 3].includes(parsedTier)) {
      setError("Invalid tier. Please go back and try again.");
      return;
    }

    const organizationId = activeOrg?.id;
    if (!organizationId) {
      setError("No organization found. Please contact support.");
      return;
    }

    fetch(`${BACKEND_URL}/ltd/checkout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: parsedTier, organizationId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error ?? "Failed to start checkout. Please try again.");
        }
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
      });
  }, [session, activeOrg, isPending, tier, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-neutral-400 underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <div className="w-6 h-6 border-2 border-[#2FC7B8] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-neutral-400">
        {isPending ? "Loading…" : "Redirecting to checkout…"}
      </p>
    </div>
  );
}

export default function LtdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-[#2FC7B8] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LtdCheckoutContent />
    </Suspense>
  );
}
