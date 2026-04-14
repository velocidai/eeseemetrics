"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UptimeIndexPage() {
  const { site } = useParams<{ site: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${site}/uptime/monitors`);
  }, [router, site]);

  return null;
}
