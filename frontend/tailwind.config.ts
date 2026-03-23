import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: "var(--font-syne)",
        mono: "var(--font-dm-mono)",
        sans: "var(--font-dm-sans)",
      },
      colors: {
        ink: {
          950: "#08111e",
          900: "#0d1b2e",
          800: "#1a2e45",
          700: "#1e3a5f",
        },
        parchment: {
          50: "#f4f1eb",
          100: "#ede9e1",
          200: "#e0dbd0",
        },
        text: {
          primary: {
            dark: "#f0ede6",
            light: "#0d1b2e",
          },
          secondary: {
            dark: "#8899aa",
            light: "#556070",
          },
          tertiary: {
            dark: "#4a5a6a",
            light: "#9aa8b4",
          },
        },
        accent: {
          dark: "#f59e0b",
          light: "#d97706",
        },
        verdict: {
          true: "#10b981",
          false: "#f43f5e",
          partial: "#f59e0b",
          unknown: "#8899aa",
          ai: "#8b5cf6",
        },
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        barFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--bar-width)" },
        },
        fadePulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1.0" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "bar-fill": "barFill 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-pulse": "fadePulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
