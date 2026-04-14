import { LandingPageTemplate } from "@/components/LandingPageTemplate";
import { createMetadata, createOGImageUrl } from "@/lib/metadata";
import { useExtracted } from "next-intl";

export const metadata = createMetadata({
  title: "Eesee Metrics — Analytics that tells you what changed",
  description:
    "Privacy-first web analytics with AI reports, anomaly detection, and MCP server. Know what's happening on your site without checking dashboards.",
  openGraph: {
    images: [createOGImageUrl("Eesee Metrics — Analytics that tells you what changed", "AI reports, anomaly alerts, and MCP server on top of powerful privacy-first analytics.")],
  },
  twitter: {
    images: [createOGImageUrl("Eesee Metrics — Analytics that tells you what changed", "AI reports, anomaly alerts, and MCP server on top of powerful privacy-first analytics.")],
  },
});

export default function HomePage() {
  const t = useExtracted();

  return (
    <LandingPageTemplate
      title={t("Analytics that tells you what changed")}
      subtitle={t("Privacy-first analytics with weekly reports, anomaly alerts, and natural-language data access. Know what's happening without staring at dashboards.")}
    />
  );
}
