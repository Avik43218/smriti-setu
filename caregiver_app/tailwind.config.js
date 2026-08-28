/** @type {import('tailwindcss').Config} */
module.exports = {
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
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Bengali"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderRadius: { card: '16px' },
    },
  },
  plugins: [],
};