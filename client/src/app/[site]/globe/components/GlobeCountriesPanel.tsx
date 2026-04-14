"use client";

import { useMetric } from "../../../../api/analytics/hooks/useGetMetric";

function getFlagEmoji(code: string) {
  if (!code || code.length !== 2) return "🌍";
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function getCountryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function GlobeCountriesPanel() {
  const { data: countryData } = useMetric({ parameter: "country" });
  const countries = countryData?.data?.slice(0, 18) ?? [];
  const maxCount = countries[0]?.count ?? 1;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 py-4">
      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
        Top Countries
      </h3>
      {countries.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          No visitor data for the selected period.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          {[0, 1, 2].map((col) => {
            const perCol = Math.ceil(countries.length / 3);
            const slice = countries.slice(col * perCol, (col + 1) * perCol);
            return (
            <div key={col} className="flex flex-col gap-0.5">
              {slice
                .map((c, j) => {
                  const rank = col * perCol + j + 1;
                  return (
                    <div
                      key={c.value}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500 w-4 text-right shrink-0">
                        {rank}
                      </span>
                      <span className="text-base leading-none shrink-0">
                        {getFlagEmoji(c.value)}
                      </span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                        {getCountryName(c.value)}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-500 rounded-full transition-all"
                            style={{ width: `${(c.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-neutral-700 dark:text-neutral-300 w-12 text-right">
                          {c.count.toLocaleString()}
                        </span>
                        <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500 w-8 text-right">
                          {c.percentage < 1 ? "<1" : Math.round(c.percentage)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
