/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          card: {
            DEFAULT: "hsl(0 0% 100%)",
            foreground: "hsl(222.2 47.4% 11.2%)",
          },
          muted: {
            foreground: "hsl(215.4 16.3% 46.9%)",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
      },
    },
    plugins: [
      require('tailwindcss-animate'),
    ],
  }