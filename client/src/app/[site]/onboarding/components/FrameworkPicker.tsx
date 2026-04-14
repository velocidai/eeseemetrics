"use client";

import { useState } from "react";
import { Check, Copy, LayoutGrid, List } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FRAMEWORKS, FrameworkId, getSnippet } from "../snippets";

interface FrameworkPickerProps {
  siteId: string | number;
  onNext: () => void;
  onBack: () => void;
}

const GRID_PLATFORMS: { id: FrameworkId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "html",        label: "HTML",        icon: () => <span className="text-xs font-bold text-neutral-300">&lt;/&gt;</span> },
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

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
    >
      {copied ? (
        <><Check className="w-3 h-3 text-accent-400" />Copied!</>
      ) : (
        <><Copy className="w-3 h-3" />Copy</>
      )}
    </button>
  );
}

// ── Grid view ──────────────────────────────────────────────────────────────
function GridView({ siteId, onNext, onBack }: FrameworkPickerProps) {
  const [selected, setSelected] = useState<(typeof GRID_PLATFORMS)[0] | null>(null);
  const snippet = selected ? getSnippet(selected.id, siteId) : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Choose your platform</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Pick yours and we'll show you exactly where to put the snippet.
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {GRID_PLATFORMS.map((p) => {
          const Icon = p.icon;
          const isSelected = selected?.id === p.id && selected?.label === p.label;
          return (
            <button
              key={p.label}
              onClick={() => setSelected(p)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                isSelected
                  ? "border-accent-500 bg-accent-500/10"
                  : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
              )}
            >
              <Icon className="w-5 h-5 text-neutral-400 dark:text-neutral-300" />
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight text-center">
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {snippet && selected && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {snippet.instruction}
          </p>
          <div className="relative">
            <pre className="bg-neutral-950 text-neutral-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
              {snippet.code}
            </pre>
            <CopyButton code={snippet.code} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <Button
          onClick={onNext}
          disabled={!selected}
          className="bg-accent-600 hover:bg-accent-500 text-white disabled:opacity-40"
        >
          I've installed it — verify →
        </Button>
      </div>
    </div>
  );
}

// ── Tab view (original) ────────────────────────────────────────────────────
function TabView({ siteId, onNext, onBack }: FrameworkPickerProps) {
  const [activeFramework, setActiveFramework] = useState<FrameworkId>("html");
  const snippet = getSnippet(activeFramework, siteId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Choose your framework</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Copy the snippet and paste it into your site.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            onClick={() => setActiveFramework(fw.id)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors font-medium",
              activeFramework === fw.id
                ? "bg-accent-500 border-accent-500 text-white"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-accent-500/50 hover:text-accent-500"
            )}
          >
            {fw.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {snippet.instruction}
      </p>
      <div className="relative">
        <pre className="bg-neutral-950 text-neutral-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
          {snippet.code}
        </pre>
        <CopyButton code={snippet.code} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} className="bg-accent-600 hover:bg-accent-500 text-white">
          I've installed it — verify →
        </Button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export function FrameworkPicker(props: FrameworkPickerProps) {
  const isDev = process.env.NODE_ENV === "development";
  const [useGrid, setUseGrid] = useState(true);

  return (
    <div>
      {isDev && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setUseGrid(true)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                useGrid
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              <LayoutGrid className="w-3 h-3" /> Grid
            </button>
            <button
              onClick={() => setUseGrid(false)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                !useGrid
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              <List className="w-3 h-3" /> Tabs
            </button>
          </div>
        </div>
      )}
      {useGrid ? <GridView {...props} /> : <TabView {...props} />}
    </div>
  );
}
