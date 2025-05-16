/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './app/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#01C3A7',
        secondary: '#0693E3',
        border: '#F5F3F3',
        textContainer: '#111928',
        activePrimary: '#07AE96',
        activeSecondary: '#0885CD',
        lightPrimary: '#E6F9F4',
        lightSecondary: '#EBF5FA',
        lightGray: '#F9F9F9',
        backgroundHover: '#F6F6F6',
        tabDefault: '#EDEDED',
      },
    },
  },
  plugins: [],
};
