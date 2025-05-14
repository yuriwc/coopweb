import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(breadcrumbs|button|calendar|card|checkbox|chip|date-input|drawer|dropdown|form|input|link|modal|navbar|pagination|radio|skeleton|spacer|spinner|table|toast|user|ripple|menu|divider|popover|avatar).js",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Cores adicionais no estilo Yeezy (preto e branco puros)
        black: "#000000",
        white: "#FFFFFF",
      },
      fontFamily: {
        // Fontes finas e modernas (similar ao Yeezy)
        sans: ["Helvetica Neue", "Arial", "sans-serif"],
        thin: ["Inter", "Helvetica", "sans-serif"], // Para pesos mais leves (font-weight: 100-300)
      },
      fontWeight: {
        light: "300", // Peso leve para textos finos
        normal: "400",
        medium: "500",
      },
      spacing: {
        // Espaçamentos generosos (estilo Yeezy)
        "128": "32rem", // Para sections grandes
        "144": "36rem",
      },
      borderWidth: {
        // Bordas finas
        "1": "1px",
      },
    },
  },
  plugins: [heroui()],
} satisfies Config;
