import { LandingPageTemplate } from "@/components/LandingPageTemplate";
import { createMetadata, createOGImageUrl } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Eesee Metrics - More Conversions. Same Traffic.",
  description:
    "Stop losing customers you already have. Eesee Metrics shows you exactly where visitors drop off, which traffic converts, and what to fix first — in one clean dashboard.",
  openGraph: {
    images: [createOGImageUrl("More conversions. Same traffic.", "Stop losing customers you already have. Eesee Metrics shows you exactly where visitors drop off, which traffic converts, and what to fix first.")],
  },
  twitter: {
    images: [createOGImageUrl("More conversions. Same traffic.", "Stop losing customers you already have. Eesee Metrics shows you exactly where visitors drop off, which traffic converts, and what to fix first.")],
  },
});

export default function LandingPage3() {
  return (
    <LandingPageTemplate
      title="More conversions. Same traffic."
      subtitle="Stop losing customers you already have. Eesee Metrics shows you exactly where visitors drop off, which traffic converts, and what to fix first — in one clean dashboard. 1 line of code. Live in 5 minutes."
    />
  );
}
