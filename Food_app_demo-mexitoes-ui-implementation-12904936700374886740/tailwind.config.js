/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#ec6d13",
        "primary-dark": "#d15c0b",
        "background-light": "#f8f7f6",
        "background-dark": "#181411",
        "surface-dark": "#241e19",
        "surface-light": "#ffffff",
        "surface-highlight": "#2C2C2C",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "2.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
