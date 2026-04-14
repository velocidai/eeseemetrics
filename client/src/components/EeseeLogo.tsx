"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useWhiteLabel } from "../hooks/useIsWhiteLabel";
import { Skeleton } from "./ui/skeleton";

// ── Inline animated SVG primitives ──────────────────────────────────────────
// Must be inlined (not <img src>) so CSS animations work in the browser.
// Each component uses uniquely-prefixed class names to avoid keyframe conflicts
// when multiple SVG <style> blocks land in the global DOM.

/** Animated Piel icon — idle breathing animation. For dark or transparent backgrounds. */
export function PielIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-10 -5 100 115"
      width={size}
      height={size}
      className={className}
    >
      <style>{`
        .pi-body { transform-origin: 40px 52.6px; animation: piBreath 2.4s ease-in-out infinite; }
        @keyframes piBreath {
          0%   { transform: scaleX(1)    scaleY(1); }
          25%  { transform: scaleX(0.92) scaleY(1.08); }
          50%  { transform: scaleX(1)    scaleY(1); }
          75%  { transform: scaleX(1.08) scaleY(0.93); }
          100% { transform: scaleX(1)    scaleY(1); }
        }
        .pi-eye { transform-box: fill-box; transform-origin: center; animation: piBlink 4s ease-in-out infinite; }
        .pi-eye-r { animation-delay: 0.04s; }
        @keyframes piBlink {
          0%, 88%, 96%, 100% { transform: scaleY(1); }
          92%                { transform: scaleY(0.07); }
        }
      `}</style>
      <g className="pi-body">
        <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
        <rect className="pi-eye"        x="22" y="40" width="12" height="12" fill="#0a1015" rx="2" />
        <rect className="pi-eye pi-eye-r" x="46" y="40" width="12" height="12" fill="#0a1015" rx="2" />
      </g>
    </svg>
  );
}

/** Animated Piel icon — loading/processing animation (squash, stretch, rotate). */
export function PielLoadingIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-10 -5 100 115"
      width={size}
      height={size}
      className={className}
    >
      <style>{`
        .pl-body { transform-origin: 40px 52.6px; animation: plSpin 2.8s ease-in-out infinite; }
        @keyframes plSpin {
          0%   { transform: scaleX(1)    scaleY(1)    rotate(0deg); }
          10%  { transform: scaleX(1.18) scaleY(0.78) rotate(0deg); }
          22%  { transform: scaleX(0.82) scaleY(1.22) rotate(0deg); }
          32%  { transform: scaleX(1.12) scaleY(0.84) rotate(0deg); }
          40%  { transform: scaleX(0.88) scaleY(1.14) rotate(0deg); }
          55%  { transform: scaleX(0.92) scaleY(1.08) rotate(180deg); }
          68%  { transform: scaleX(0.92) scaleY(1.08) rotate(360deg); }
          76%  { transform: scaleX(1.22) scaleY(0.74) rotate(360deg); }
          84%  { transform: scaleX(0.90) scaleY(1.10) rotate(360deg); }
          92%  { transform: scaleX(1.04) scaleY(0.97) rotate(360deg); }
          100% { transform: scaleX(1)    scaleY(1)    rotate(360deg); }
        }
        .pl-eye { transform-box: fill-box; transform-origin: center; animation: plBlinkSpin 2.8s ease-in-out infinite; }
        .pl-eye-r { animation-delay: 0.04s; }
        @keyframes plBlinkSpin {
          0%   { transform: scaleY(1); }
          10%  { transform: scaleY(0.4); }
          22%  { transform: scaleY(1); }
          32%  { transform: scaleY(0.4); }
          40%  { transform: scaleY(1); }
          45%  { transform: scaleY(0.05); }
          68%  { transform: scaleY(0.05); }
          78%  { transform: scaleY(1.2); }
          100% { transform: scaleY(1); }
        }
      `}</style>
      <g className="pl-body">
        <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
        <rect className="pl-eye"         x="22" y="40" width="12" height="12" fill="#0a1015" rx="2" />
        <rect className="pl-eye pl-eye-r" x="46" y="40" width="12" height="12" fill="#0a1015" rx="2" />
      </g>
    </svg>
  );
}

/**
 * Animated "eesee metrics" wordmark with Piel icon.
 * variant="dark" renders white text (for dark/navy backgrounds).
 * variant="light" renders dark text (for light backgrounds).
 */
export function EeseeWordmark({
  width = 140,
  variant = "dark",
  className,
}: {
  width?: number;
  variant?: "dark" | "light";
  className?: string;
}) {
  const height = Math.round(width * (80 / 340));
  const isDark = variant === "dark";
  const textColor = isDark ? "#ffffff" : "#0D1322";
  const subColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(13,19,34,0.5)";
  const eyeColor = isDark ? "#0a1015" : "#0D1322";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 80"
      width={width}
      height={height}
      className={className}
    >
      <style>{`
        .ew-body { transform-origin: 40px 52.6px; animation: ewBreath 2.4s ease-in-out infinite; }
        @keyframes ewBreath {
          0%   { transform: scaleX(1)    scaleY(1); }
          25%  { transform: scaleX(0.92) scaleY(1.08); }
          50%  { transform: scaleX(1)    scaleY(1); }
          75%  { transform: scaleX(1.08) scaleY(0.93); }
          100% { transform: scaleX(1)    scaleY(1); }
        }
        .ew-eye { transform-box: fill-box; transform-origin: center; animation: ewBlink 4s ease-in-out infinite; }
        .ew-eye-r { animation-delay: 0.04s; }
        @keyframes ewBlink {
          0%, 88%, 96%, 100% { transform: scaleY(1); }
          92%                { transform: scaleY(0.07); }
        }
      `}</style>
      <g className="ew-body">
        <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
        <rect className="ew-eye"          x="22" y="40" width="12" height="12" fill={eyeColor} rx="2" />
        <rect className="ew-eye ew-eye-r" x="46" y="40" width="12" height="12" fill={eyeColor} rx="2" />
      </g>
      <text
        x="90" y="51"
        fontFamily="-apple-system, 'Helvetica Neue', sans-serif"
        fontSize="28" fontWeight="600" letterSpacing="-0.5"
        fill={textColor}
      >eesee</text>
      <text
        x="183" y="51"
        fontFamily="-apple-system, 'Helvetica Neue', sans-serif"
        fontSize="28" fontWeight="300" letterSpacing="-0.3"
        fill={subColor}
      >metrics</text>
    </svg>
  );
}

/** Piel icon with a floating ? badge — used as a "What is this page?" trigger. */
export function PielHelpIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-10 -38 125 148"
      width={size}
      height={size}
      className={className}
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
        .ph-badge { animation: phFloat 3s ease-in-out infinite; }
        @keyframes phFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
      `}</style>
      <g className="ph-body">
        <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
        <rect className="ph-eye"           x="22" y="40" width="12" height="12" fill="#0a1015" rx="2" />
        <rect className="ph-eye ph-eye-r"  x="46" y="40" width="12" height="12" fill="#0a1015" rx="2" />
      </g>
      <g className="ph-badge">
        <text x="82" y="-2" textAnchor="middle" dominantBaseline="central"
              fill="#2FC7B8" fontSize="48" fontWeight="900" fontFamily="system-ui, sans-serif">?</text>
      </g>
    </svg>
  );
}

// ── White-label-aware logo components ────────────────────────────────────────

/** Icon-only logo. Falls back to white-label image if set. */
export function EeseeLogo({ width = 28, height = 28 }: { width?: number; height?: number }) {
  const { whiteLabelImage, isPending } = useWhiteLabel();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || isPending) return <Skeleton style={{ width, height }} />;
  if (whiteLabelImage) return <Image src={whiteLabelImage} alt="Eesee Metrics" width={width} height={height} />;

  return <PielIcon size={Math.max(width, height)} />;
}

/**
 * Full wordmark logo. Falls back to white-label image if set.
 * height is derived from the aspect ratio of the wordmark (340:80) unless overridden for white-label images.
 */
export function EeseeTextLogo({
  width = 140,
  height,
  variant = "white",
}: {
  width?: number;
  height?: number;
  /** "white" = white text on dark bg (default). "dark" = dark text on light bg. */
  variant?: "white" | "dark";
}) {
  const { whiteLabelImage, isPending } = useWhiteLabel();
  const [mounted, setMounted] = useState(false);
  const derivedHeight = height && height > 0 ? height : Math.round(width * (80 / 340));

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || isPending) return <Skeleton style={{ width, height: derivedHeight }} />;
  if (whiteLabelImage) return <Image src={whiteLabelImage} alt="Eesee Metrics" width={width} height={derivedHeight} />;

  // variant="white" means white text → dark background variant of the wordmark
  return <EeseeWordmark width={width} variant={variant === "white" ? "dark" : "light"} />;
}
