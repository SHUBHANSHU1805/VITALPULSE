/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vs: {
          bg:       '#070D1B',
          card:     '#0B1329',
          card2:    '#0F1835',
          cyan:     '#00D4FF',
          cyan2:    '#06B6D4',
          purple:   '#8B5CF6',
          violet:   '#A855F7',
          blue:     '#3B82F6',
          green:    '#10B981',
          rose:     '#F43F5E',
          amber:    '#F59E0B',
          orange:   '#F97316',
          text:     '#E2E8F0',
          dim:      '#64748B',
          border:   '#1A2744',
        },
        // Legacy aliases
        clinical: {
          dark: '#070D1B', card: '#0B1329', border: '#1A2744',
          teal: '#00D4FF', cyan: '#06B6D4', blue: '#3B82F6',
          indigo: '#8B5CF6', violet: '#A855F7',
          emerald: '#10B981', rose: '#F43F5E', amber: '#F59E0B',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      boxShadow: {
        'cyan':   '0 0 20px rgba(0,212,255,0.30)',
        'purple': '0 0 20px rgba(139,92,246,0.30)',
        'card':   '0 4px 24px rgba(0,0,0,0.50)',
        'glow-teal': '0 0 20px rgba(0,212,255,0.30)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.30)',
        'glow-rose': '0 0 20px rgba(244,63,94,0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
