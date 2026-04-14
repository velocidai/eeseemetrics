import Link from "next/link";
import {
  SiAstro,
  SiFramer,
  SiGatsby,
  SiGhost,
  SiNextdotjs,
  SiReact,
  SiRemix,
  SiShopify,
  SiSquarespace,
  SiSvelte,
  SiVuedotjs,
  SiWebflow,
  SiWordpress,
} from "@icons-pack/react-simple-icons";
import { ComponentType } from "react";
import { useExtracted } from "next-intl";

type IconProps = { className?: string; size?: number };

const SCRIPT_SNIPPET = `<script src="https://app.eeseemetrics.com/api/script.js" data-site-id="YOUR_SITE_ID" async></script>`;

const platforms: {
  name: string;
  icon: ComponentType<IconProps>;
  snippet: string;
  path: string;
  isScript?: boolean;
}[] = [
  { name: "Next.js",      icon: SiNextdotjs,   snippet: SCRIPT_SNIPPET, path: "/docs/guides/react/next-js",       isScript: true },
  { name: "React",        icon: SiReact,       snippet: SCRIPT_SNIPPET, path: "/docs/guides/react/vite-cra",     isScript: true },
  { name: "Vue",          icon: SiVuedotjs,    snippet: SCRIPT_SNIPPET, path: "/docs/guides/vue/vite",           isScript: true },
  { name: "Astro",        icon: SiAstro,       snippet: SCRIPT_SNIPPET, path: "/docs/guides/astro",              isScript: true },
  { name: "Svelte",       icon: SiSvelte,      snippet: SCRIPT_SNIPPET, path: "/docs/guides/svelte/sveltekit",   isScript: true },
  { name: "Gatsby",       icon: SiGatsby,      snippet: SCRIPT_SNIPPET, path: "/docs/guides/gatsby",             isScript: true },
  { name: "Remix",        icon: SiRemix,       snippet: SCRIPT_SNIPPET, path: "/docs/guides/remix",              isScript: true },
  { name: "WordPress",    icon: SiWordpress,   snippet: SCRIPT_SNIPPET, path: "/docs/guides/wordpress",          isScript: true },
  { name: "Shopify",      icon: SiShopify,     snippet: SCRIPT_SNIPPET, path: "/docs/guides/shopify",            isScript: true },
  { name: "Webflow",      icon: SiWebflow,     snippet: SCRIPT_SNIPPET, path: "/docs/guides/webflow",            isScript: true },
  { name: "Framer",       icon: SiFramer,      snippet: SCRIPT_SNIPPET, path: "/docs/guides/framer",             isScript: true },
  { name: "Squarespace",  icon: SiSquarespace, snippet: SCRIPT_SNIPPET, path: "/docs/guides/squarespace",        isScript: true },
  { name: "Ghost",        icon: SiGhost,       snippet: SCRIPT_SNIPPET, path: "/docs/guides/ghost",              isScript: true },
];

function PlatformCard({
  name,
  icon: Icon,
  snippet,
  path,
  isScript,
}: (typeof platforms)[number]) {
  return (
    <Link href={path} className="group block">
      <div className="h-full bg-[#0D1322] border border-[#243146] rounded-xl p-5 hover:border-[#2FC7B8]/40 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="h-5 w-5 text-neutral-300 group-hover:text-[#2FC7B8] transition-colors" />
          <span className="text-sm font-medium text-[#EAF1F8]">{name}</span>
        </div>
        <div className="bg-[#060C18] rounded-lg px-3 py-2 font-mono text-xs text-[#A8B6C7] truncate">
          {isScript ? (
            <span><span className="text-[#2FC7B8]">&lt;script</span> src=&quot;cdn.eeseemetrics.com/script.js&quot;<span className="text-[#2FC7B8]">&gt;</span></span>
          ) : (
            <span><span className="text-[#2FC7B8]">$</span> {snippet}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function IntegrationsGrid() {
  const t = useExtracted();
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {platforms.map((p) => (
          <PlatformCard key={p.name} {...p} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/docs/guides"
          className="text-sm text-[#A8B6C7] hover:text-[#2FC7B8] transition-colors"
        >
          {t("View all integrations")} →
        </Link>
      </div>
    </div>
  );
}
