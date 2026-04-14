import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/[locale]/(home)/layout.tsx
 * Docs Layout: app/[locale]/docs/layout.tsx
 */
export function baseOptions(lang: string): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="font-semibold text-base tracking-tight">
          Eesee Metrics
        </span>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: "Demo",
        url: "https://app.eeseemetrics.com",
        external: true,
      },
    ],
  };
}
