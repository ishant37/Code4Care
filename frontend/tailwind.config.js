/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sci-fi-dark': '#0a0e27',
        'sci-fi-blue': '#00d4ff',
        'sci-fi-red': '#ff0040',
        'sci-fi-green': '#00ff41',
        'sci-fi-purple': '#8800ff',
        'grid': '#1a2847',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.6)',
        'neon-red': '0 0 20px rgba(255, 0, 64, 0.6)',
        'neon-green': '0 0 20px rgba(0, 255, 65, 0.6)',
      }
    },
  },
  plugins: [],
}
