"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Uptime monitoring has moved to per-site routes: /[siteId]/uptime/monitors
export default function UptimePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
