import { CustomHeader } from "@/components/CustomHeader";
import { Footer } from "@/components/Footer";
import { LtdBanner } from "@/components/LtdBanner";
import { LTD_CONFIG } from "@/lib/ltd-config";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const totalSlotsLeft =
    LTD_CONFIG.slots.tier1 + LTD_CONFIG.slots.tier2 + LTD_CONFIG.slots.tier3;

  return (
    <>
      {LTD_CONFIG.active && (
        <LtdBanner endDate={LTD_CONFIG.endDate} slotsLeft={totalSlotsLeft} />
      )}
      <CustomHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
