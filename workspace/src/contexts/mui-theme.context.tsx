import { PropsWithChildren } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export function MuiThemeContextProvider({ children }: PropsWithChildren) {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#0F172A', // Slate 900 - clean, professional dark blue
        light: '#334155', // Slate 700
        dark: '#020617', // Slate 950
      },
      secondary: {
        main: '#0EA5E9', // Sky 500 - clean, modern blue
        light: '#38BDF8', // Sky 400
        dark: '#0284C7', // Sky 600
      },
      background: {
        default: '#F8FAFC', // Slate 50 - very light gray
        paper: '#FFFFFF', // Pure white for cards
      },
      text: {
        primary: '#0F172A', // Slate 900
        secondary: '#64748B', // Slate 500
      },
      divider: '#E2E8F0', // Slate 200
      success: {
        main: '#10B981', // Emerald 500
      },
      error: {
        main: '#EF4444', // Red 500
      },
      warning: {
        main: '#F59E0B', // Amber 500
      },
      info: {
        main: '#3B82F6', // Blue 500
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.01em' },
      h4: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' },
      body1: { fontSize: '0.875rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { fontWeight: 500, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#CBD5E1',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F1F5F9',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 6,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          outlined: {
            borderWidth: 1.5,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E2E8F0',
              },
              '&:hover fieldset': {
                borderColor: '#CBD5E1',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: '#E2E8F0',
          },
          head: {
            fontWeight: 600,
            color: '#475569',
            backgroundColor: '#F8FAFC',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}