import { TrackedButton } from "@/components/TrackedButton";
import { useExtracted } from "next-intl";


function PielHero({ size = 56 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-10 -5 100 115"
      width={size}
      height={size}
      className="inline-block align-middle drop-shadow-[0_0_16px_rgba(47,199,184,0.5)] mb-2"
    >
      <style>{`
        .ph-body { transform-origin: 40px 52.6px; animation: phBreath 2.4s ease-in-out infinite; }
        @keyframes phBreath {
          0%   { transform: scaleX(1)    scaleY(1); }
          25%  { transform: scaleX(0.92) scaleY(1.08); }
          50%  { transform: scaleX(1)    scaleY(1); }
          75%  { transform: scaleX(1.08) scaleY(0.93); }
          100% { transform: scaleX(1)    scaleY(1); }
        }
        .ph-eye { transform-box: fill-box; transform-origin: center; animation: phBlink 4s ease-in-out infinite; }
        .ph-eye-r { animation-delay: 0.04s; }
        @keyframes phBlink {
          0%, 88%, 96%, 100% { transform: scaleY(1); }
          92%                { transform: scaleY(0.07); }
        }
      `}</style>
      <g className="ph-body">
        <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
        <rect className="ph-eye"         x="22" y="40" width="12" height="12" fill="#0a1015" rx="2" />
        <rect className="ph-eye ph-eye-r" x="46" y="40" width="12" height="12" fill="#0a1015" rx="2" />
      </g>
    </svg>
  );
}

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
}

export function HeroSection({
  title,
  subtitle,
}: HeroSectionProps) {
  const t = useExtracted();

  return (
    <>
      <div className="overflow-x-hidden pt-16 md:pt-24 px-4 max-w-6xl mx-auto w-full text-center">
        <h1 className="text-4xl md:text-5xl lg:text-7xl tracking-tight font-semibold text-neutral-900 dark:text-[#EAF1F8]">
          {title}
        </h1>
        <h2 className="text-base md:text-xl pt-4 md:pt-6 text-neutral-500 dark:text-[#A8B6C7] font-normal max-w-2xl mx-auto">
          {subtitle}
        </h2>

        <div className="flex flex-row items-center justify-center gap-3 md:gap-4 mt-8 md:mt-10">
          <TrackedButton
            href="https://app.eeseemetrics.com/signup"
            eventName="signup"
            eventProps={{ location: "hero", button_text: "get started" }}
            className="whitespace-nowrap bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] font-medium px-6 py-2.5 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2FC7B8]/40 cursor-pointer"
          >
            {t("Start for free")}
          </TrackedButton>
        </div>

        {/* Dashboard screenshot with Piel badge */}
        <div className="relative w-full max-w-[1000px] mx-auto mt-12 mb-10">
          <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-[#2FC7B8]/12 rounded-full blur-[100px] opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-[#7CCBFF]/10 rounded-full blur-[100px] opacity-70"></div>
          <div className="relative z-10">
            <img
              src="/dashbord-screenshot.png"
              alt="Eesee Metrics dashboard"
              className="w-full rounded-xl border border-[#243146] shadow-2xl"
            />
            {/* Piel speech bubble — top-right corner */}
            <div className="absolute -top-20 right-2 flex flex-col items-end">
              {/* Speech bubble */}
              <div className="relative bg-[#0D1322] border border-[#2FC7B8]/40 rounded-xl px-3 py-2 shadow-[0_0_20px_rgba(47,199,184,0.2)] mr-2">
                <span className="text-sm font-medium text-[#2FC7B8] whitespace-nowrap">
                  Pageviews up by 36%!
                </span>
                {/* Tail at bottom-right corner, shifted left to align over Piel */}
                <div className="absolute -bottom-[8px] right-[20px] w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#2FC7B8]/40" />
                <div className="absolute -bottom-[6px] right-[21px] w-0 h-0 border-l-[6px] border-l-transparent border-t-[7px] border-t-[#0D1322]" />
              </div>
              <PielHero size={36} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
