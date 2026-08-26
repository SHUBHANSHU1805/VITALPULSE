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
          dark:         '#0B1120',
          card:         '#0F172A',
          border:       '#1E2D4A',
          // Primary blue accent (replaces teal)
          blue:         '#3B82F6',
          'blue-light': '#60A5FA',
          indigo:       '#6366F1',
          violet:       '#7C3AED',
          // Status colors (unchanged)
          emerald:      '#10B981',
          rose:         '#F43F5E',
          amber:        '#F59E0B',
          // Legacy aliases so nothing breaks during migration
          teal:         '#3B82F6',
          cyan:         '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue':   '0 0 24px -3px rgba(59, 130, 246, 0.45)',
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.35)',
        'glow-rose':   '0 0 20px -3px rgba(244, 63, 94, 0.40)',
        'card':        '0 4px 24px 0 rgba(0, 0, 0, 0.35)',
        'card-hover':  '0 8px 32px 0 rgba(59, 130, 246, 0.18)',
        // Legacy alias
        'glow-teal':   '0 0 24px -3px rgba(59, 130, 246, 0.45)',
      }
    },
  },
  plugins: [],
}
