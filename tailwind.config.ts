import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#fefefc",
        ink: "#000000",
        graphite: "#0a0a0a",
        smoke: "#6b6b6b",
        iron: "#444444",
        "verdigris-wash": "#ebf5ed",
        "slate-mist": "#bdd4f0",
        "pewter-haze": "#98a7aa",
      },
      fontFamily: {
        serif: ["var(--font-rhymes-display)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-suisse-intl)", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1200px",
      },
      spacing: {
        "section": "80px",
      },
      borderRadius: {
        tag: "2px",
        btn: "2px",
        card: "8px",
        input: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
