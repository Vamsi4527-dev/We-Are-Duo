export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0d1211",
          card: "#151c1b",
          header: "#111817",
          input: "#101615",
          received: "#26322f",
          sent: "#0f766e",
          border: "#303c39",
          inputBorder: "#46534f",
          text: "#FFFFFF",
          muted: "#aab8b5",
        },
        light: {
          bg: "#FFFFFF",
          card: "#FFFFFF",
          border: "#d9e2e1",
          text: "#10201f",
          muted: "#566867",
          dateSep: "#eaf0ef",
        },
      },
    },
  },

  plugins: [],
};
