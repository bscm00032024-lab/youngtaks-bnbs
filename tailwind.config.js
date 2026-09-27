/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          red: "#D62828",
        },
      },
    },
  },
  plugins: [],
}
