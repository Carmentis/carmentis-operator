import { PropsWithChildren } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export function MuiThemeContextProvider({ children }: PropsWithChildren) {
  // Define the MUI theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1c4dcb', // primary-light from the original theme
      },
      secondary: {
        main: '#9C8714', // secondary-light from the original theme
      },
    },
    typography: {
      body1: {
        fontSize: 13
      }
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
          sx: {
            fontSize: 13,
          }
        },
      },
      MuiTextField: {
        defaultProps: {
          className: 'rounded-md',
          size: "small"
        },
      },
      MuiCard: {
        defaultProps: {
          sx: {
            p: 2
          },
          elevation: 2
        }
      },
      MuiTab: {
        defaultProps: {
          sx: {
            py: 0,
          }
        }
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}