/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "theme-transition":
          "theme-transition 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "theme-transition": {
          "0%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
          "50%": { transform: "scale(1.1) rotate(180deg)", opacity: "0.8" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
          "100%": {
            boxShadow:
              "0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)",
          },
        },
      },
      transitionProperty: {
        theme:
          "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
      },
      transitionDuration: {
        600: "600ms",
      },
      transitionTimingFunction: {
        theme: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

