/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "custom-blue-dark": "#06308e",
        "custom-blue-light": "#A5EEF0",
      },
    },
  },
  plugins: [],
};
