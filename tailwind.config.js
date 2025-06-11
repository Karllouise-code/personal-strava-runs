module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#1a1a1a",
        card: "#2d2d2d",
        light: "#e0e0e0",
        orange: {
          600: "#fc4c02",
        },
        teal: {
          500: "#2dd4bf",
        },
      },
      scale: {
        102: "1.02",
      },
    },
  },
  plugins: [],
};
