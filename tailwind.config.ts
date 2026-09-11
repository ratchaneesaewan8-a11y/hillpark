import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HILLPARK ADVENTURE brand palette
        brand: {
          orange: "#FF6A00",
          green: "#09251D",
          teal: "#08A6A6",
          bg: "#F6F8F7",
          text: "#17201D",
        },
      },
      fontFamily: {
        sans: ["var(--font-prompt)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(9, 37, 29, 0.18)",
        soft: "0 2px 12px -4px rgba(9, 37, 29, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
