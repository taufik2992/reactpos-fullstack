/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fde8d2',
          200: '#fad1a3',
          300: '#f6b66c',
          400: '#f1973e',
          500: '#ec7c1a',
          600: '#d15e0e',
          700: '#a8460f',
          800: '#893713',
          900: '#6f2f12',
        },
        coffee: {
          50: '#faf6f3',
          100: '#f5ede4',
          200: '#ecd9c6',
          300: '#dfc0a0',
          400: '#cfa177',
          500: '#c1865a',
          600: '#b3724d',
          700: '#945a41',
          800: '#79493a',
          900: '#623d31',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};