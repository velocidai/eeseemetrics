import type { Metadata } from "next";
import { createMetadata, createOGImageUrl } from "@/lib/metadata";
import { PricingPageClient } from "./components/PricingPageClient";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description: "Eesee Metrics pricing starts at $14/mo. Privacy-first web analytics with AI reports, session replay, anomaly alerts, and MCP tools. Free trial. Cancel anytime.",
  openGraph: {
    images: [createOGImageUrl("Pricing", "Eesee Metrics pricing starts at $14/mo. 7-day free trial.")],
  },
  twitter: {
    images: [createOGImageUrl("Pricing", "Eesee Metrics pricing starts at $14/mo. 7-day free trial.")],
  },
});

export default function PricingPage() {
  return <PricingPageClient />;
}
