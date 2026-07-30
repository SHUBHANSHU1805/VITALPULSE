/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          dark: '#0B1120',
          card: '#151F32',
          border: '#212E48',
          teal: '#14B8A6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(20, 184, 166, 0.4)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
      }
    },
  },
  plugins: [],
}
