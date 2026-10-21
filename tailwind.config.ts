import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme tokens from mockup: dark brown/charcoal base, warm beige text, copper/bronze accent
        base: {
          bg: "#141210",          // Dark brown / charcoal base
          surface: "#1c1916",     // Warm stone surface
          elevated: "#24201c",    // Raised stone pedestal surface
          border: "#332d27",      // Weathered stone border
          divider: "#26211c",     // Subtle section divider
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          dim:     "rgb(var(--accent-dim) / <alpha-value>)",
          copper:  "#c27847",
          bronze:  "#8e4f27",
          warm:    "#d48b59",
        },
        text: {
          primary: "#f0e8dc",     // Warm beige / linen text
          secondary: "#a69a8d",   // Warm stone taupe
          muted:   "#786e63",     // Weathered stone
        },
        stone: {
          50:  "#f0e8dc",
          100: "#dcd1c2",
          200: "#b8a996",
          300: "#968673",
          400: "#756655",
          500: "#574b3e",
          600: "#3d342a",
          700: "#2d261f",
          800: "#1c1916",
          900: "#141210",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        serif: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
      },
      letterSpacing: {
        ultra: "0.28em",
        widest: "0.2em",
        wider: "0.12em",
      },
      borderRadius: {
        sm: "3px",
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
