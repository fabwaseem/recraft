/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f6540a",
        dark: "#121212",
        darkBg: "#212121",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
