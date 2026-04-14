"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SiteUptimeNotificationsRedirect() {
  const { site } = useParams<{ site: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${site}/settings/notifications`);
  }, [site, router]);
  return null;
}
