"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Uptime monitoring has moved to per-site routes: /[siteId]/uptime/incidents
export default function UptimeIncidentsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
