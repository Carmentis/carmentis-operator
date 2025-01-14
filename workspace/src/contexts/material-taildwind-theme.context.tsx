import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@material-tailwind/react';

export function MaterialTailwindThemeContextProvider({children}: PropsWithChildren) {
	// define the MT theme
	const theme = {
		button: {
			defaultProps: {
				className: 'bg-primary-light'
			}
		},
		iconButton: {
			defaultProps:{
				className: 'bg-primary-light'
			}
		},
		input: {
			defaultProps: {
				className: 'rounded-md'
			}
		}
	}

	return <ThemeProvider value={theme}>
		{children}
	</ThemeProvider>
}