/** @type {import('tailwindcss').Config} */
export default {
  prefix: "wg-",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        testcolor: "purple",
      },
    },
  },

  plugins: [],
};
