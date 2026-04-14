import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Only report errors in production
    enabled: process.env.NODE_ENV === "production",
    // Ignore common noise
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
    beforeSend(event) {
      // Don't send events for known bot/crawler traffic
      if (event.request?.headers?.["user-agent"]?.match(/bot|crawler|spider/i)) {
        return null;
      }
      return event;
    },
  });
}
