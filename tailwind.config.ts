import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F7F4",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#101418", soft: "#3B4450", muted: "#5E6873" },
        line: "#E3E4DF",
        navy: { DEFAULT: "#0E1B2C", 800: "#132438", 700: "#1A3048", 600: "#274463" },
        accent: { DEFAULT: "#0B6E6B", bright: "#00908C", tint: "#E3F1F0", onDark: "#5FD3CD" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "1200px" },
      boxShadow: { card: "0 1px 2px rgba(16,20,24,.04), 0 8px 24px -12px rgba(16,20,24,.12)" },
    },
  },
  plugins: [],
};
export default config;
