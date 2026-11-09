import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "ui-serif", "serif"],
      },
      colors: {
        bg: "#f4ede3",
        panel: "#fffaf3",
        border: "#e6d8c3",
        accent: "#c2410c",
        forest: "#1f3d2b",
      },
    },
  },
  plugins: [],
} satisfies Config;
