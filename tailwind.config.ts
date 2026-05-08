import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        toss: {
          blue: "var(--toss-blue)",
          black: "var(--toss-black)",
          gray: "var(--toss-gray)",
          lightGray: "var(--toss-lightgray)",
          border: "var(--toss-border)",
        },
      },
      borderRadius: {
        toss: "18px",
      },
    },
  },
  plugins: [],
};
export default config;
