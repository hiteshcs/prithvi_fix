/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-navy': '#1a237e',
        'gov-navy-dark': '#0d1453',
        'gov-navy-light': '#283593',
        'gov-saffron': '#FF9933',
        'gov-saffron-dark': '#E68A2E',
        'gov-green': '#138808',
        'gov-green-light': '#1ba50a',
        'gov-cream': '#FFF8E1',
        'gov-text': '#212121',
        'gov-text-secondary': '#555555',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
