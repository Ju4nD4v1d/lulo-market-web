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
  plugins: [
    function({ addBase, theme }) {
      addBase({
        // Override default focus styles
        '[type="text"]:focus, [type="email"]:focus, [type="url"]:focus, [type="password"]:focus, [type="number"]:focus, [type="date"]:focus, [type="datetime-local"]:focus, [type="month"]:focus, [type="search"]:focus, [type="tel"]:focus, [type="time"]:focus, [type="week"]:focus, [multiple]:focus, textarea:focus, select:focus': {
          '--tw-ring-color': theme('colors.primary.500'),
          '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
          '--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
          'box-shadow': 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)',
          'border-color': theme('colors.primary.500'),
        },
        // Override checkbox and radio styles
        '[type="checkbox"]:checked, [type="radio"]:checked': {
          'background-color': theme('colors.primary.500'),
          'border-color': theme('colors.primary.500'),
        },
        '[type="checkbox"]:focus, [type="radio"]:focus': {
          '--tw-ring-color': theme('colors.primary.500'),
        },
        // Override time input styles
        '[type="time"]': {
          'color-scheme': 'light',
        },
        '[type="time"]:focus': {
          '--tw-ring-color': theme('colors.primary.500'),
          'border-color': theme('colors.primary.500'),
        },
      });
    },
  ],
};