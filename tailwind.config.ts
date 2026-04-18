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
        background: "#f2f4f6",
        surface: "#ffffff",
        toss: {
          blue: "#3182f6",
          black: "#191f28",
          gray: "#4e5968",
          lightGray: "#f2f4f6",
          border: "#e5e8eb",
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
