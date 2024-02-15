/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          // background: rgba(10, 10, 10, 1);
          DEFAULT: "rgba(10 10 10 / <alpha-value>)",
        },
        foreground: {
          // background: rgba(237, 224, 220, 1);
          DEFAULT: "rgba(237 224 220 / <alpha-value>)",
        },
        surface: {
          // rgba(20, 17, 15, 1)
          DEFAULT: "rgba(20 17 15 / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgba(208 75 0 / <alpha-value>)",
          container: "rgba(250 92 0 / <alpha-value>)",
        },
        body: {
          DEFAULT: "rgba(180  169 165 / <alpha-value>)",
        },
        heading: {
          DEFAULT: "rgba(250 239 235 / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
