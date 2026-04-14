import { cn } from "@/lib/utils";

interface BackgroundGridProps {
  className?: string;
}

export function BackgroundGrid({ className }: BackgroundGridProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 -top-32 md:-top-48",
        "[background-size:24px_24px]",
        "[background-image:radial-gradient(circle,#d4d4d4_1px,transparent_1px)]",
        "dark:[background-image:radial-gradient(circle,#404040_1px,transparent_1px)]",
        "[mask-image:linear-gradient(to_bottom,black,transparent_80%),linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        "[mask-composite:intersect]",
        className
      )}
    />
  );
}
