module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#1a202c',
        darkText: '#e2e8f0',
        darkInput: '#2d3748',
        darkBorder: '#4a5568',
      },
    },
  },
  plugins: [],
}