import { memo } from "react";

// Deterministic widths — avoids Math.random() during render which would cause
// React hydration mismatches (server/client values differ).
const WIDTHS = [100, 70, 40, 33, 28, 23, 18, 16, 14, 11];
const LABEL_WIDTHS = [120, 95, 85, 55, 70, 45, 60, 50, 42, 58];
const VALUE_WIDTHS = [45, 30, 55, 25, 40, 35, 20, 50, 38, 28];

export const StandardSkeleton = memo(() => {
  const widths = WIDTHS;
  const labelWidths = LABEL_WIDTHS;
  const valueWidths = VALUE_WIDTHS;

  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="relative h-6 flex items-center">
          <div
            className="absolute inset-0 bg-neutral-150/50 dark:bg-neutral-800 py-2 rounded-md animate-pulse"
            style={{ width: `${widths[index]}%` }}
          ></div>
          <div className="z-5 mx-2 flex justify-between items-center text-sm w-full">
            <div className="flex items-center gap-1">
              <div
                className="h-4 bg-neutral-150 dark:bg-neutral-800 rounded animate-pulse"
                style={{ width: `${labelWidths[index]}px` }}
              ></div>
            </div>
            <div className="text-sm flex gap-2">
              <div
                className="h-4 bg-neutral-150 dark:bg-neutral-800 rounded animate-pulse"
                style={{ width: `${valueWidths[index]}px` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
});
