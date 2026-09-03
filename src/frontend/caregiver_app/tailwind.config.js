/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF5EA',
        surface: '#FFFDF8',
        ink: '#2E2A24',
        'ink-soft': '#6B625A',
        terracotta: { DEFAULT: '#B5562F', dark: '#8C3F20' },
        gold: '#C9962C',
        sage: '#6E8C6A',
        alert: '#C1272D', // SOS only — do not reuse elsewhere
        border: '#E4D9C4',
        'status-urgent': '#8C2C24',
        'status-info': '#2C4A6E',
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Bengali"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderWidth: {
        stripe: '3px',
      },
      borderRadius: { card: '16px' },
      boxShadow: {
        card: '0 2px 4px rgba(46,42,36,0.08)',
        'card-soft': '0 1px 3px rgba(46,42,36,0.05)',
      },
    },
  },
  plugins: [],
};