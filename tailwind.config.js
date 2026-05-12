/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3dffa0',
        secondary: '#ff4d4d',
        tertiary: '#4da6ff',
        accent: '#ffd84d',
        dark: '#060608',
        'dark-surface': '#0d0d12',
        'dark-surface-2': '#13131a',
        'dark-border': 'rgba(255,255,255,0.07)',
        'dark-muted': '#6a6a7a',
      },
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif'],
        'display': ['Bebas Neue', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.4)' },
        }
      }
    },
  },
  plugins: [],
};
