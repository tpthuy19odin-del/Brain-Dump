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
        forest: {
          50: '#f2f8f4',
          100: '#e1f0e6',
          200: '#c5e2cf',
          300: '#99cdab',
          400: '#64b081',
          500: '#3c945f',
          600: '#2c764a',
          700: '#245e3c',
          800: '#1b4d3e',
          900: '#164034',
          950: '#0c231c',
        },
        obsidian: {
          950: '#080d0b',
          900: '#0e1512',
          850: '#121c18',
          800: '#17241f',
          750: '#1d2c26',
          700: '#23362f',
          600: '#2e453c',
          500: '#415e53',
        }
      }
    },
  },
  plugins: [],
}

