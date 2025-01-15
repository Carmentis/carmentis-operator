import withMT from '@material-tailwind/react/utils/withMT';

import { colors as defaultColors } from 'tailwindcss/defaultTheme';


const colors = {
  ...defaultColors,
  ...{
    customPrimary: '#159A9C',
    primary: {
      light: '#159A9C',
      dark: '#002333',
      gray: '#B4BEC9'
    },
    secondary: {
      light: "#9C8714",
      dark: "#333020"
    },
    primaryBackground: "#f6f9ff",
    primaryForeground: "#4154f1"
  },
}

module.exports = withMT({
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
    },
  },
  plugins: [],
});