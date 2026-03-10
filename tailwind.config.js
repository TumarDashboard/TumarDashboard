module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or false or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'color_A': '#0f172a', /* Slate 900 */
        'color_B': '#3b82f6', /* Blue 500 */
        'color_C': '#60a5fa', /* Blue 400 */
        'color_D': '#93c5fd', /* Blue 300 */
        'color_E': '#bfdbfe', /* Blue 200 */
        'color_F': '#e2e8f0', /* Slate 200 */
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