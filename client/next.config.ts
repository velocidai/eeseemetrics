import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: "./src",
    extract: { sourceLocale: "en" },
    messages: {
      path: "./messages",
      format: "json",
      locales: ["en", "de", "fr", "zh", "es", "pl", "it", "ko", "pt", "ja", "cs"],
    },
  },
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // CSP: frame-ancestors prevents clickjacking; other directives are permissive to not
  // break Mapbox, Stripe, Turnstile, and inline Tailwind styles
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_DISABLE_SIGNUP: process.env.NEXT_PUBLIC_DISABLE_SIGNUP,
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const sentryConfig = {
  // Only upload source maps if DSN is set (i.e. in production with Sentry configured)
  silent: true,
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(withNextIntl(nextConfig), sentryConfig)
  : withNextIntl(nextConfig);
