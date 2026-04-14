import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts", "node_modules", "dist"],
    environmentMatchGlobs: [
      ["src/analytics-script/**", "jsdom"],
    ],
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
          environmentMatchGlobs: [
            ["src/analytics-script/**", "jsdom"],
          ],
        },
      },
      {
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
