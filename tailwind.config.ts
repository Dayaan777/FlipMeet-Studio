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
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          dim:     "rgb(var(--accent-dim) / <alpha-value>)",
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
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shock: {
          "0%":   { transform: "translate(0,0) rotate(0deg)" },
          "10%":  { transform: "translate(-10px, -8px) rotate(-5deg)" },
          "20%":  { transform: "translate(10px, 8px) rotate(5deg)" },
          "30%":  { transform: "translate(-8px, 10px) rotate(-4deg)" },
          "40%":  { transform: "translate(12px, -6px) rotate(6deg)" },
          "50%":  { transform: "translate(-10px, 4px) rotate(-5deg)" },
          "60%":  { transform: "translate(8px, -8px) rotate(4deg)" },
          "70%":  { transform: "translate(-6px, 6px) rotate(-3deg)" },
          "80%":  { transform: "translate(6px, -4px) rotate(2deg)" },
          "90%":  { transform: "translate(-3px, 2px) rotate(-1deg)" },
          "100%": { transform: "translate(0,0) rotate(0deg)" },
        },
      },
      animation: {
        "cart-bump": "cart-bump 0.35s cubic-bezier(0.36,0.07,0.19,0.97)",
        "toast-in":  "toast-in 0.2s ease-out forwards",
        marquee: "marquee 20s linear infinite",
        shock: "shock 0.4s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
