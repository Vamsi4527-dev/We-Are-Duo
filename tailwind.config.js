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
          bg: "#0D1211",
          card: "#151C1B",
          header: "#111817",
          input: "#101615",
          received: "#26322F",
          sent: "#0F766E",
          border: "#303C39",
          inputBorder: "#46534F",
          text: "#FFFFFF",
          muted: "#7F908B",
          secondary: "#AAB8B5",
        },
        light: {
          bg: "#FFFFFF",
          card: "#FFFFFF",
          input: "#FFFFFF",
          inputBorder: "#46534F",
          received: "#F1F5F4",
          sent: "#0F766E",
          border: "#D9E2E1",
          text: "#10201F",
          secondary: "#566867",
          muted: "#7F908B",
          dateSep: "#EAF0EF",
        },
        // Semantic colors
        status: {
          online: "#0F766E",
          away: "#7F908B",
          offline: "#EF4444",
        },
        brand: {
          sent: "#0F766E",
          receivedLight: "#F1F5F4",
          receivedDark: "#26322F",
          read: "#0F766E",
        },
      },
    },
  },

  plugins: [],
};
