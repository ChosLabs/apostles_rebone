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
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        toss: {
          blue: "rgb(var(--toss-blue) / <alpha-value>)",
          black: "rgb(var(--toss-black) / <alpha-value>)",
          gray: "rgb(var(--toss-gray) / <alpha-value>)",
          lightGray: "rgb(var(--toss-lightgray) / <alpha-value>)",
          border: "rgb(var(--toss-border) / <alpha-value>)",
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
