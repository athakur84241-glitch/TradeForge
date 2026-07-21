import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { background: "hsl(var(--background))", foreground: "hsl(var(--foreground))", surface: "hsl(var(--surface))", card: "hsl(var(--card))", border: "hsl(var(--border))", muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" }, primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" }, success: "hsl(var(--success))", warning: "hsl(var(--warning))", danger: "hsl(var(--danger))" },
      borderRadius: { "tf-sm": "0.5rem", "tf-md": "0.75rem", "tf-lg": "1rem", "tf-xl": "1.25rem" },
      boxShadow: { glow: "0 0 32px hsl(var(--primary) / .24)", "card": "0 12px 32px rgb(0 0 0 / .22)" },
      keyframes: { "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } } },
      animation: { "fade-up": "fade-up 240ms ease-out both" }
    }
  },
  plugins: []
};
export default config;
