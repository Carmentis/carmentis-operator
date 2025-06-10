import { colors as defaultColors } from 'tailwindcss/defaultTheme';

const colors = {
  ...defaultColors,
  ...{

    primaryBackground: "#f6f9ff",
    primaryForeground: "#4154f1"
  },
}

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
    },
  },
  plugins: [],
};
