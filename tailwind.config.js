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
        // Brand color - single reference point
        brand: '#C8E400',
        // Primary color scale (Lulo Green) - must be hex for Tailwind opacity modifiers
        primary: {
          50: '#F9FBE7',
          100: '#F0F6CF',
          200: '#E2F0B6',
          300: '#D4E99E',
          400: '#C8E400',
          500: '#b3cc00',
          600: '#9ab300',
          700: '#829900',
          800: '#698000',
          900: '#516600',
        },
        // Secondary colors (Dark/Charcoal)
        secondary: {
          DEFAULT: '#1f2937',
          light: '#374151',
          dark: '#111827',
        },
        // Semantic colors
        coral: '#F05E36',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        // Background colors
        background: '#F7F4ED',
        // Text colors
        text: '#2E2E2E',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    function({ addBase, theme }) {
      addBase({
        // Input focus styles
        '[type="text"]:focus, [type="email"]:focus, [type="url"]:focus, [type="password"]:focus, [type="number"]:focus, [type="date"]:focus, [type="datetime-local"]:focus, [type="month"]:focus, [type="search"]:focus, [type="tel"]:focus, [type="time"]:focus, [type="week"]:focus, [multiple]:focus, textarea:focus, select:focus': {
          '--tw-ring-color': theme('colors.primary.500'),
          '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
          '--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
          'box-shadow': 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)',
          'border-color': theme('colors.primary.500'),
        },
        // Input hover styles
        '[type="text"]:hover, [type="email"]:hover, [type="url"]:hover, [type="password"]:hover, [type="number"]:hover, [type="date"]:hover, [type="datetime-local"]:hover, [type="month"]:hover, [type="search"]:hover, [type="tel"]:hover, [type="time"]:hover, [type="week"]:hover, [multiple]:hover, textarea:hover, select:hover': {
          'border-color': theme('colors.primary.400'),
        },
        // Checkbox and radio styles
        '[type="checkbox"]:checked, [type="radio"]:checked': {
          'background-color': theme('colors.primary.500'),
          'border-color': theme('colors.primary.500'),
        },
        '[type="checkbox"]:focus, [type="radio"]:focus': {
          '--tw-ring-color': theme('colors.primary.500'),
        },
        // Time input styles
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