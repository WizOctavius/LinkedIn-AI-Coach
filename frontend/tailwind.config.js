/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FFE4C4',
          secondary: '#A52A2A',
        }
      },
      fontFamily: {
        heading: ['Ranade_Bold', 'system-ui', 'sans-serif'],
        body: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}