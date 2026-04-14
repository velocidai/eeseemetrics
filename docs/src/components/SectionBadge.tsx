import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionBadge({ children, className }: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-block bg-[#2FC7B8]/10 border border-[#2FC7B8]/25 text-[#2FC7B8] px-3 py-1 rounded-sm text-sm font-medium tracking-wide",
        className
      )}
    >
      {children}
    </div>
  );
}
