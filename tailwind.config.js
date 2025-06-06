/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cadmium: {
          orange: "#EB8B2B",
        },
        smoky: {
          black: "#180E04",
        },
        white: "#FFFFFF",
      },
      fontFamily: {
        heading: ["Jakusty", "Open Sans", "sans-serif"], // Jakusty for headings, fallback to Open Sans
        body: ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
