import dynamic from "next/dynamic";

// Disable SSR for the journeys page to prevent hydration mismatches caused by
// Radix UI Slider + D3 SankeyDiagram interaction with React 19 SSR.
const JourneysContent = dynamic(() => import("./JourneysContent"), { ssr: false });

export default function JourneysPage() {
  return <JourneysContent />;
}
