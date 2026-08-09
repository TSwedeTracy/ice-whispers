import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070c",       // near-black background
        frost: {
          100: "#eaf6ff",
          300: "#9fd7f2",
          500: "#4fb8e6",       // icy blue accent
          700: "#1e6f94",
        },
        wyrd: {
          400: "#b18cf0",       // violet accent (used sparingly)
          600: "#6d4bb0",
        },
        parchment: "#e8dfce",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(79, 184, 230, 0.25)",
        glowViolet: "0 0 40px rgba(177, 140, 240, 0.25)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.6" },
          "100%": { transform: "translateY(-120vh) translateX(20px)", opacity: "0" },
        },
        cardFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 14s linear infinite",
        fadeUp: "fadeUp 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
