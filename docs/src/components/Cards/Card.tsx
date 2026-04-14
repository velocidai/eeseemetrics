import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  bare?: boolean;
}

export function Card({ title, description, children, className, icon: Icon, bare }: CardProps) {
  return (
    <div
      className={cn("bg-neutral-100/50 dark:bg-neutral-800/20 p-4 md:p-6 rounded-xl border border-neutral-300/50 dark:border-neutral-800/50 overflow-hidden", className)}
    >
      {!bare && (
        <>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2FC7B8]/15 to-[#26B0A2]/10 dark:from-[#2FC7B8]/10 dark:to-[#26B0A2]/8 border border-[#2FC7B8]/30 dark:border-[#2FC7B8]/20 shadow-md shadow-[#2FC7B8]/5 dark:shadow-[#2FC7B8]/5 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-[#26B0A2] dark:text-[#2FC7B8]" />
            </div>
          )}
          {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
          {description && <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">{description}</p>}
        </>
      )}
      {children}
    </div>
  );
}
