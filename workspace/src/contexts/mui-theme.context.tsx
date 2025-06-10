import { PropsWithChildren } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export function MuiThemeContextProvider({ children }: PropsWithChildren) {
  // Define the MUI theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#159A9C', // primary-light from the original theme
      },
      secondary: {
        main: '#9C8714', // secondary-light from the original theme
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          className: 'bg-primary-light',
        },
      },
      MuiIconButton: {
        defaultProps: {
          className: 'bg-primary-light',
        },
      },
      MuiTextField: {
        defaultProps: {
          className: 'rounded-md',
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}