import withMT from '@material-tailwind/react/utils/withMT';

import { colors as defaultColors } from 'tailwindcss/defaultTheme';


const colors = {
  ...defaultColors,
  ...{
    primary: {
      light: '#159A9C',
      dark: '#002333',
      gray: '#B4BEC9'
    },
    primaryBackground: "#f6f9ff",
    primaryForeground: "#4154f1"
  },
}

module.exports = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
    },
  },
  plugins: [],
});