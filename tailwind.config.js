/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0D1F2D",
        red: "#E63946",
        teal: "#2EC4B6",
        ivory: "#F4F1DE",
        "navy-glass": "rgba(13, 31, 45, 0.75)",
        "red-glow": "rgba(230, 57, 70, 0.25)",
        "teal-glow": "rgba(46, 196, 182, 0.25)",
        "border-dim": "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
