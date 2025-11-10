/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Isso lê TUDO dentro de 'app'
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};