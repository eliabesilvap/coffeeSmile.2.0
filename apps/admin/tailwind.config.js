/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      colors: {
        brand: {
          50: '#f7f2ec',
          100: '#efe4d7',
          200: '#e1cbb0',
          300: '#d2b189',
          400: '#c59863',
          500: '#ad7f4a',
          600: '#8b653a',
          700: '#6a4c2b',
          800: '#4a341e',
          900: '#2c1f12',
        },
        slate: {
          950: '#0b1220',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
