/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        brand: "#1f2937",
        accent: "#0ea5e9",
        mint: "#10b981"
      }
    }
  },
  plugins: []
};
