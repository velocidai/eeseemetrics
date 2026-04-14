"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useGetSite } from "@/api/admin/hooks/useGetSite";
import { completeOnboarding } from "@/api/admin/endpoints/sites";
import { FrameworkPicker } from "./components/FrameworkPicker";
import { VerifyStep } from "./components/VerifyStep";
import { CelebrationStep } from "./components/CelebrationStep";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Your site", "Install snippet", "Verify", "Done!"];

function ConfirmStep({
  domain,
  onNext,
  onSkip,
}: {
  domain: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Welcome! Let's set up tracking</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          We'll walk you through adding the analytics snippet to{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {domain}
          </span>
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          onClick={onNext}
          className="bg-accent-600 hover:bg-accent-500 text-white"
        >
          Get started →
        </Button>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center w-full mb-8">
      {STEP_LABELS.map((label, index) => {
        const step = (index + 1) as Step;
        const done = current > step;
        const active = current === step;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  active
                    ? "bg-accent-600 text-white shadow-lg shadow-accent-600/30"
                    : done
                      ? "bg-accent-600 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                )}
              >
                {done ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  current >= step
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400"
                )}
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mb-4 rounded-full transition-colors",
                  current > step
                    ? "bg-accent-600"
                    : "bg-neutral-200 dark:bg-neutral-800"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const { site } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>(process.env.NODE_ENV === "development" ? 2 : 1);
  const { data: siteData } = useGetSite(Number(site));

  if (!site) return null;

  const domain = siteData?.domain ?? site;

  function handleSkip() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`onboarding_skip_${site}`, "1");
    }
    router.push(`/${site}`);
  }

  async function handleVerified() {
    try {
      await completeOnboarding(Number(site));
    } catch {
      // best-effort — still advance to celebration
    }
    setStep(4);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="w-full max-w-[600px] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
        {step !== 4 && <StepIndicator current={step} />}

        {step === 1 && (
          <ConfirmStep
            domain={domain}
            onNext={() => setStep(2)}
            onSkip={handleSkip}
          />
        )}
        {step === 2 && (
          <FrameworkPicker
            siteId={site}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <VerifyStep
            siteId={site}
            onSuccess={handleVerified}
            onSkip={handleSkip}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && <CelebrationStep siteId={site} />}
      </div>
    </div>
  );
}
