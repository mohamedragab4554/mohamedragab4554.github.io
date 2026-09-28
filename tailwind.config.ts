import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts"],
  theme: {
    extend: {
      colors: {
        paper: "#070D18",
        surface: "#0D1728",
        ink: { DEFAULT: "#E8F0F6", soft: "#B4C2CF", muted: "#8C9CAD" },
        line: "#1C2A40",
        navy: { DEFAULT: "#0E1B2C", 800: "#132438", 700: "#1A3048", 600: "#274463" },
        accent: { DEFAULT: "#5FD3CD", bright: "#37C4BD", tint: "#0E2A30", onDark: "#5FD3CD" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "1200px" },
      boxShadow: { card: "inset 0 1px 0 rgba(255,255,255,.04), 0 20px 40px -24px rgba(0,0,0,.7)", glow: "0 0 0 1px rgba(95,211,205,.35), 0 0 32px -6px rgba(95,211,205,.35)" },
    },
  },
  plugins: [],
};
export default config;
