module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or false or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'color_A': '#170305',
        'color_B': '#2E1114',
        'color_C': '#501B1D',
        'color_D': '#64485C',
        'color_E': '#83677B',
        'color_F': '#ADADAD',
        'color_G': '#FFFFFF',
      },
      fontFamily: {
        'font_A': ['Empty'],
        'font_B': ['Sansation'],
      },
      screens: {
        'mm': '375px',
        'fl': '1920px',
        '2fl': '2240px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}