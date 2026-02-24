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
        "primary": "#ce1713", // Romantic Kiss (Red)
        "primary-dark": "#a8120e",
        "accent": "#ffc152", // Web Golden Tainoi (Yellow)
        "background-light": "#f8f7f6",
        "background-dark": "#000000", // Black
        "surface-dark": "#111111",
        "surface-light": "#ffffff",
        "surface-highlight": "#222222",
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
