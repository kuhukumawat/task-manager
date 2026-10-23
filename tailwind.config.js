/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        button: "var(--color-button, #8687E7)",
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
