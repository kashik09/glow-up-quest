import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#f6f1ea",
        ink: "#1c1b19",
        muted: "#5a534d",
        accent: "#e16837",
        highlight: "#2f6b59",
        card: "#ffffff",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(35, 24, 18, 0.08)",
      },
      borderRadius: {
        xl: "24px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "serif"],
        body: ["var(--font-body)", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
