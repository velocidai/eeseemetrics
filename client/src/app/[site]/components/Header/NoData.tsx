"use client";
import { useState } from "react";
import {
  SiAngular,
  SiAstro,
  SiFramer,
  SiGatsby,
  SiGhost,
  SiNextdotjs,
  SiNuxt,
  SiReact,
  SiRemix,
  SiShopify,
  SiSquarespace,
  SiSvelte,
  SiVuedotjs,
  SiWebflow,
  SiWix,
  SiWordpress,
} from "@icons-pack/react-simple-icons";

import Link from "next/link";
import { useExtracted } from "next-intl";
import { useGetSite, useSiteHasData } from "../../../../api/admin/hooks/useSites";
import { CodeSnippet } from "../../../../components/CodeSnippet";
import { VerifyInstallation } from "../../../../components/VerifyInstallation";
import { useStore } from "../../../../lib/store";
import { FrameworkId, getSnippet } from "../../onboarding/snippets";
import { cn } from "../../../../lib/utils";

const PLATFORMS: { id: FrameworkId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "html",        label: "HTML",        icon: () => <span className="text-[10px] font-bold text-neutral-400">&lt;/&gt;</span> },
  { id: "nextjs",      label: "Next.js",     icon: SiNextdotjs },
  { id: "react",       label: "React",       icon: SiReact },
  { id: "vue",         label: "Vue",         icon: SiVuedotjs },
  { id: "nuxt",        label: "Nuxt",        icon: SiNuxt },
  { id: "svelte",      label: "SvelteKit",   icon: SiSvelte },
  { id: "astro",       label: "Astro",       icon: SiAstro },
  { id: "angular",     label: "Angular",     icon: SiAngular },
  { id: "gatsby",      label: "Gatsby",      icon: SiGatsby },
  { id: "remix",       label: "Remix",       icon: SiRemix },
  { id: "wordpress",   label: "WordPress",   icon: SiWordpress },
  { id: "shopify",     label: "Shopify",     icon: SiShopify },
  { id: "webflow",     label: "Webflow",     icon: SiWebflow },
  { id: "wix",         label: "Wix",         icon: SiWix },
  { id: "framer",      label: "Framer",      icon: SiFramer },
  { id: "squarespace", label: "Squarespace", icon: SiSquarespace },
  { id: "ghost",       label: "Ghost",       icon: SiGhost },
];

export function NoData() {
  const t = useExtracted();
  const { site } = useStore();
  const { data: siteHasData, isLoading } = useSiteHasData(site);
  const { data: siteMetadata, isLoading: isLoadingSiteMetadata } = useGetSite(site);
  const [selectedId, setSelectedId] = useState<FrameworkId>("html");

  if (!siteHasData && !isLoading && !isLoadingSiteMetadata) {
    const siteId = siteMetadata?.siteId ?? site;
    const snippet = getSnippet(selectedId, siteId);

    return (
      <div className="mt-6 max-w-2xl mx-auto px-4">
        {/* Status header */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("Waiting for analytics from {domain}...", { domain: siteMetadata?.domain ?? "" })}
          </p>
        </div>

        {/* Platform picker */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          {t("Add the tracking snippet to your website to get started.")}
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 mb-4">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                title={p.label}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                  selectedId === p.id
                    ? "border-accent-500 bg-accent-500/10"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                )}
              >
                <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-300" />
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-tight text-center truncate w-full">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Snippet */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-2 mb-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{snippet.instruction}</p>
          <CodeSnippet language="HTML" code={snippet.code} className="text-xs" />
        </div>

        {/* Verify */}
        {siteMetadata?.siteId && (
          <div className="mb-3">
            <VerifyInstallation siteId={siteMetadata.siteId} />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
          <span>
            {t("Need help?")}{" "}
            <a
              href="https://eeseemetrics.com/docs/guides"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-500 hover:text-accent-400 transition-colors"
            >
              {t("View all platform guides")} →
            </a>
          </span>
          <Link
            href={`/${site}/onboarding`}
            className="text-accent-500 hover:text-accent-400 transition-colors"
          >
            {t("Open setup wizard")} →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
