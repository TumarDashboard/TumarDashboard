module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or false or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'color_A': '#064e3b', /* Emerald 900 */
        'color_B': '#10b981', /* Emerald 500 */
        'color_C': '#34d399', /* Emerald 400 */
        'color_D': '#6ee7b7', /* Emerald 300 */
        'color_E': '#a7f3d0', /* Emerald 200 */
        'color_F': '#d1fae5', /* Emerald 100 */
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