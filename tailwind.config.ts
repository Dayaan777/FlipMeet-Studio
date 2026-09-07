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
    },
  },
  plugins: [],
};

export default config;
