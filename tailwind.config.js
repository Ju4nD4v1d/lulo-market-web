/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F9FBE7',
          100: '#F0F6CF',
          200: '#E2F0B6',
          300: '#D4E99E',
          400: '#C8E400', // Primary color
          500: '#A3C700', // Accent
          600: '#5A7302', // Contrast
          700: '#4D6302',
          800: '#405301',
          900: '#334201',
        },
        coral: '#F05E36',
        background: '#F7F4ED',
        text: '#2E2E2E',
      },
    },
  },
  plugins: [],
};