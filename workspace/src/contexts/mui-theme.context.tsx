import { PropsWithChildren } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

// Glass effect styles
const glassStyles = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  borderRadius: 2,
  transition: 'all 0.3s ease-in-out',
};



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
        fontSize: 14
      }
    },
    components: {
      MuiButton: {
        defaultProps: {
          sx: {
            p: 1,
            px: 2,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(21, 154, 156, 0.3)',
            //background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
            '&:hover': {
              boxShadow: '0 6px 20px rgba(21, 154, 156, 0.4)',
            }
          }
        }
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
            p: 2,
            ...glassStyles
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