/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4f46e5",
          DEFAULT: "#4338ca",
          dark: "#3730a3",
        },
      },
    },
  },
  plugins: [],
};
