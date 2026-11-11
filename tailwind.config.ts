import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          surface: "#F6FAF8",
          surfaceAlt: "#EDF5F1",
          green: {
            DEFAULT: "#2E9E6B",
            light: "#3BB57E",
            soft: "#E7F6EF",
            dark: "#237B53",
            deep: "#1A5E3F",
          },
          blue: {
            DEFAULT: "#7CC4E8",
            light: "#EBF6FC",
            medium: "#52A8D4",
            dark: "#2E7EA6",
          },
          ink: {
            DEFAULT: "#1F2D2A",
            muted: "#526660",
            subtle: "#7B8F89",
          },
          border: "#DCE8E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        "card-lg": "24px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 8px 24px -4px rgba(31, 45, 42, 0.06), 0 2px 6px -1px rgba(31, 45, 42, 0.03)",
        "soft-md": "0 14px 32px -6px rgba(31, 45, 42, 0.08), 0 4px 10px -2px rgba(31, 45, 42, 0.04)",
        "soft-lg": "0 20px 44px -8px rgba(31, 45, 42, 0.10), 0 6px 14px -3px rgba(31, 45, 42, 0.04)",
      },
      transitionTimingFunction: {
        natural: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

