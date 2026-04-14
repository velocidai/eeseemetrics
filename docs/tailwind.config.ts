import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#f0fdfb",
          100: "#ccfbf5",
          200: "#99f6eb",
          300: "#5eead8",
          400: "#2dd4bf",
          500: "#2FC7B8",
          600: "#26B0A2",
          700: "#1a9489",
          800: "#15756c",
          900: "#146159",
          950: "#053a35",
        },
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "marquee-vertical-reverse": "marquee-vertical-reverse var(--duration) linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical-reverse": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(100% + var(--gap)))" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
