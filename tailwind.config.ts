import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens from FLIPMEET_STUDIO_GUIDE.md §2 Visual Identity
        base: {
          bg: "#000000",
          surface: "#111111",
          border: "#242424",
        },
        accent: {
          DEFAULT: "#FF4D1E",
          dim: "#B33A16",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#9A9A9A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        sm: "4px",
      },
      keyframes: {
        "cart-bump": {
          "0%":   { transform: "scale(1)" },
          "30%":  { transform: "scale(1.28)" },
          "60%":  { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        "toast-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "cart-bump": "cart-bump 0.35s cubic-bezier(0.36,0.07,0.19,0.97)",
        "toast-in":  "toast-in 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
