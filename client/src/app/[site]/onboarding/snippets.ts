export type FrameworkId =
  | "html"
  | "nextjs"
  | "react"
  | "vue"
  | "nuxt"
  | "svelte"
  | "astro"
  | "angular"
  | "gatsby"
  | "remix"
  | "wordpress"
  | "shopify"
  | "webflow"
  | "wix"
  | "framer"
  | "squarespace"
  | "ghost";

export const FRAMEWORKS: { id: FrameworkId; label: string }[] = [
  { id: "html",        label: "HTML" },
  { id: "nextjs",      label: "Next.js" },
  { id: "react",       label: "React" },
  { id: "vue",         label: "Vue" },
  { id: "nuxt",        label: "Nuxt" },
  { id: "svelte",      label: "SvelteKit" },
  { id: "astro",       label: "Astro" },
  { id: "angular",     label: "Angular" },
  { id: "gatsby",      label: "Gatsby" },
  { id: "remix",       label: "Remix" },
  { id: "wordpress",   label: "WordPress" },
  { id: "shopify",     label: "Shopify" },
  { id: "webflow",     label: "Webflow" },
  { id: "wix",         label: "Wix" },
  { id: "framer",      label: "Framer" },
  { id: "squarespace", label: "Squarespace" },
  { id: "ghost",       label: "Ghost" },
];

export type SnippetResult = {
  instruction: string;
  code: string;
};

export function getSnippet(
  frameworkId: FrameworkId,
  siteId: string | number
): SnippetResult {
  const scriptSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/script.js`
      : "/api/script.js";

  const tag = `<script\n  src="${scriptSrc}"\n  data-site-id="${siteId}"\n  defer\n></script>`;

  switch (frameworkId) {
    case "html":
      return {
        instruction: "Add this inside the <head> of your HTML file.",
        code: tag,
      };

    case "react":
      return {
        instruction: "Add this inside the <head> of public/index.html.",
        code: tag,
      };

    case "vue":
      return {
        instruction: "Add this inside the <head> of index.html in your project root.",
        code: tag,
      };

    case "angular":
      return {
        instruction: "Add this inside the <head> of src/index.html.",
        code: tag,
      };

    case "nextjs":
      return {
        instruction: "Add this to your root layout (app/layout.tsx) or _app.tsx using the Next.js Script component.",
        code: `import Script from 'next/script'

<Script
  src="${scriptSrc}"
  data-site-id="${siteId}"
  strategy="afterInteractive"
/>`,
      };

    case "nuxt":
      return {
        instruction: "Add this to nuxt.config.ts to inject the script globally.",
        code: `export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: '${scriptSrc}',
          'data-site-id': '${siteId}',
          defer: true,
        },
      ],
    },
  },
})`,
      };

    case "svelte":
      return {
        instruction: "Add this inside the <head> of src/app.html.",
        code: tag,
      };

    case "astro":
      return {
        instruction: "Add this inside the <head> of your base layout (e.g. src/layouts/BaseLayout.astro).",
        code: tag,
      };

    case "gatsby":
      return {
        instruction: "Add this to gatsby-ssr.tsx (or .js) using the onRenderBody API to inject into the document head.",
        code: `import React from 'react'
import type { GatsbySSR } from 'gatsby'

export const onRenderBody: GatsbySSR['onRenderBody'] = ({
  setHeadComponents,
}) => {
  setHeadComponents([
    <script
      key="eesee"
      src="${scriptSrc}"
      data-site-id="${siteId}"
      defer
    />,
  ])
}`,
      };

    case "remix":
      return {
        instruction: "Add this to app/root.tsx inside the <head> element of your document.",
        code: `<script
  src="${scriptSrc}"
  data-site-id="${siteId}"
  defer
/>`,
      };

    case "wordpress":
      return {
        instruction: "Add this to your theme's functions.php (or a custom plugin) to enqueue the script.",
        code: `<?php
function add_eesee_script() {
    wp_enqueue_script(
        'eesee-metrics',
        '${scriptSrc}',
        [],
        null,
        true
    );
    add_filter('script_loader_tag', function($tag, $handle) {
        if ($handle === 'eesee-metrics') {
            return str_replace(
                '<script',
                '<script data-site-id="${siteId}"',
                $tag
            );
        }
        return $tag;
    }, 10, 2);
}
add_action('wp_enqueue_scripts', 'add_eesee_script');`,
      };

    case "shopify":
      return {
        instruction: "In your Shopify admin go to Online Store → Themes → Edit code, open layout/theme.liquid, and add this inside the <head> tag.",
        code: tag,
      };

    case "webflow":
      return {
        instruction: "In Webflow go to Site Settings → Custom Code and paste this into the \"Head Code\" field.",
        code: tag,
      };

    case "wix":
      return {
        instruction: "In Wix go to Settings → Custom Code → Add Code, set it to load in the <head> on All pages.",
        code: tag,
      };

    case "framer":
      return {
        instruction: "In Framer go to Site Settings → General → Custom Code and paste this into \"Start of <head> tag\".",
        code: tag,
      };

    case "squarespace":
      return {
        instruction: "In Squarespace go to Settings → Advanced → Code Injection and paste this into the Header field.",
        code: tag,
      };

    case "ghost":
      return {
        instruction: "In your Ghost admin go to Settings → Code Injection and paste this into the Site Header field.",
        code: tag,
      };
  }
}
