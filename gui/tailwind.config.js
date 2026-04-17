/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hytale-purple': '#7B5BF5',
        'hytale-dark': '#1a1a1a',
        'hytale-panel': '#252525',
      }
    },
  },
  plugins: [],
}