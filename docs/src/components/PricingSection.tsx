"use client";

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { getCalApi } from "@calcom/embed-react";
import { useExtracted } from "next-intl";
import { useEffect, useState } from "react";
import { BASIC_SITE_LIMIT, BASIC_TEAM_LIMIT, STANDARD_SITE_LIMIT, STANDARD_TEAM_LIMIT } from "../lib/const";
import { EVENT_TIERS_WITH_CUSTOM, STARTER_MAX_EVENTS, getPrice } from "../lib/stripe";
import { PricingCard } from "./PricingCard";

export const formatter = Intl.NumberFormat("en", {
  notation: "compact",
}).format;

export function PricingSection({ isAnnual, setIsAnnual }: { isAnnual: boolean, setIsAnnual: (isAnnual: boolean) => void }) {
  const t = useExtracted();
  const EVENT_TIERS = EVENT_TIERS_WITH_CUSTOM;
  const [eventLimitIndex, setEventLimitIndex] = useState(0); // Default to 100k (index 0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const BASIC_FEATURES = [
    t("{count} website", { count: String(BASIC_SITE_LIMIT) }),
    t("{count} team member", { count: String(BASIC_TEAM_LIMIT) }),
    t("Web analytics dashboard"),
    t("Goals & custom events"),
    t("Uptime monitoring (5 monitors)"),
    t("2 year data retention"),
    t("Email support"),
  ];

  const STANDARD_FEATURES = [
    t("Up to {count} websites", { count: String(STANDARD_SITE_LIMIT) }),
    t("Up to {count} team members", { count: String(STANDARD_TEAM_LIMIT) }),
    t("Everything in Starter"),
    t("Sessions, funnels & journeys"),
    t("User profiles & retention"),
    t("Web vitals & error tracking"),
    t("Google Search Console"),
    t("Session replays"),
    t("AI reports (weekly) & anomaly alerts"),
    t("Uptime monitoring (10 monitors)"),
    t("Full MCP toolset (21 tools)"),
    t("3 year data retention"),
    t("Email support"),
  ];

  const PRO_FEATURES = [
    t("Everything in Pro"),
    t("Unlimited websites"),
    t("Unlimited team members"),
    t("AI reports (all cadences)"),
    t("Higher MCP rate limits"),
    t("Uptime monitoring (50 monitors)"),
    t("5 year data retention"),
    t("Priority support"),
  ];


  const eventLimit = EVENT_TIERS[eventLimitIndex];
  const basicPrices = getPrice(eventLimit, "starter", isAnnual);
  const isBasicAvailable = typeof eventLimit === "number" && eventLimit <= STARTER_MAX_EVENTS;
  const standardPrices = getPrice(eventLimit, "pro", isAnnual);
  const proPrices = getPrice(eventLimit, "scale", isAnnual);

  // Initialize Cal.com embed
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "secret" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  // Handle slider changes
  function handleSliderChange(value: number[]) {
    setEventLimitIndex(value[0]);
  }

  return (
    <section className="py-16 md:py-24 w-full relative z-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight pb-4 text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-gray-200 dark:to-gray-400">
            {t("Pricing")}
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            {t("Free trial. Cancel anytime.")}
          </p>
        </div>

        {/* Shared controls section */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex justify-between mb-6 items-center">
            <div>
              <h3 className="font-semibold mb-2">{t("Monthly pageviews")}</h3>
              <div className="text-3xl font-bold text-[#2FC7B8]">
                {typeof eventLimit === "number" ? eventLimit.toLocaleString() : t("Custom")}
              </div>
            </div>
            <div className="flex flex-col items-end relative">
              {/* Billing toggle */}
              <div className="flex mb-2 text-sm bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-full p-1">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={cn(
                    "px-3 py-1 rounded-full transition-colors cursor-pointer",
                    !isAnnual
                      ? "bg-white dark:bg-white/20 text-neutral-700 dark:text-neutral-100 font-medium"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  {t("Monthly")}
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={cn(
                    "px-3 py-1 rounded-full transition-colors cursor-pointer",
                    isAnnual
                      ? "bg-white dark:bg-white/20 text-neutral-700 dark:text-neutral-100 font-medium"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  {t("Annual")}
                </button>
                <div className="text-xs text-[#0D1322] absolute top-0 right-0 -translate-y-3 bg-[#2FC7B8] rounded-full px-2 py-0.5 whitespace-nowrap">
                  {t("Save 33%")}
                </div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <Slider
            defaultValue={[0]}
            max={EVENT_TIERS.length - 1}
            min={0}
            step={1}
            onValueChange={handleSliderChange}
            className="mb-3"
          />

          <div className="flex justify-between text-xs text-neutral-400">
            {EVENT_TIERS.map((tier, index) => (
              <span key={index} className={cn(eventLimitIndex === index && "font-bold text-[#2FC7B8]")}>
                {index === EVENT_TIERS.length - 1
                  ? "20M+"
                  : typeof tier === "number" && tier >= 1_000_000
                    ? `${tier / 1_000_000}M`
                    : typeof tier === "number"
                      ? `${tier / 1_000}K`
                      : t("Custom")}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing cards - carousel on mobile, grid on desktop */}
        {(() => {
          const basicCard = (
            <div className={cn("h-full", !isBasicAvailable && "opacity-60")}>
              <PricingCard
                title={t("Starter")}
                description={t("For personal projects and small sites")}
                priceDisplay={
                  !isBasicAvailable ? (
                    <div className="text-3xl font-bold">-</div>
                  ) : basicPrices.custom ? (
                    <div className="text-3xl font-bold">{t("Custom")}</div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold">
                        ${basicPrices.display}
                      </span>
                      <span className="ml-1 text-neutral-400">{t("/month")}</span>
                    </div>
                  )
                }
                buttonText={!isBasicAvailable ? t("Up to 250k only") : t("Start free")}
                buttonHref={!isBasicAvailable ? undefined : "https://app.eeseemetrics.com/signup"}
                features={BASIC_FEATURES}
                disabled={!isBasicAvailable}
                eventLocation={isBasicAvailable ? "basic" : undefined}
              />
            </div>
          );

          const standardCard = (
            <PricingCard
              title={t("Pro")}
              description={t("Everything you need to grow as a small business")}
              priceDisplay={
                standardPrices.custom ? (
                  <div className="text-3xl font-bold">{t("Custom")}</div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold">
                      ${standardPrices.display}
                    </span>
                    <span className="ml-1 text-neutral-400">{t("/month")}</span>
                  </div>
                )
              }
              buttonText={standardPrices.custom ? t("Contact us") : t("Start free")}
              buttonHref={standardPrices.custom ? "https://eeseemetrics.com/contact" : "https://app.eeseemetrics.com/signup"}
              features={STANDARD_FEATURES}
              eventLocation={standardPrices.custom ? undefined : "standard"}
              recommended={true}
            />
          );

          const proCard = (
            <PricingCard
              title={t("Scale")}
              description={t("Advanced AI features for professional teams")}
              priceDisplay={
                proPrices.custom ? (
                  <div className="text-3xl font-bold">{t("Custom")}</div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold">
                      ${proPrices.display}
                    </span>
                    <span className="ml-1 text-neutral-400">{t("/month")}</span>
                  </div>
                )
              }
              buttonText={proPrices.custom ? t("Contact us") : t("Start free")}
              buttonHref={proPrices.custom ? "https://eeseemetrics.com/contact" : "https://app.eeseemetrics.com/signup"}
              features={PRO_FEATURES}
              eventLocation={proPrices.custom ? undefined : "pro"}
            />
          );

          return (
            <>
              {/* Mobile carousel */}
              <div className="min-[700px]:hidden">
                <Carousel setApi={setCarouselApi} opts={{ startIndex: 1 }}>
                  <CarouselContent>
                    <CarouselItem>{basicCard}</CarouselItem>
                    <CarouselItem>{standardCard}</CarouselItem>
                    <CarouselItem>{proCard}</CarouselItem>
                  </CarouselContent>
                </Carousel>
                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: slideCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => carouselApi?.scrollTo(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors cursor-pointer",
                        currentSlide === i
                          ? "bg-[#2FC7B8]"
                          : "bg-neutral-400 dark:bg-neutral-600"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop grid */}
              <div className="hidden min-[700px]:grid min-[900px]:grid-cols-3 min-[700px]:grid-cols-2 gap-4 mx-auto justify-center items-stretch">
                {basicCard}
                {standardCard}
                {proCard}
              </div>
            </>
          );
        })()}
      </div>
    </section>
  );
}
