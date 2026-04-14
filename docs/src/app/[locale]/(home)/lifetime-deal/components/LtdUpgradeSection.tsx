"use client";

import { useState } from "react";
import { PricingSection } from "@/components/PricingSection";

export function LtdUpgradeSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  return <PricingSection isAnnual={isAnnual} setIsAnnual={setIsAnnual} />;
}
