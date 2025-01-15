import { PropsWithChildren } from 'react';

export interface ConditionallyHiddenLayoutProps {
	showOn?: boolean
}

export default function ConditionallyHiddenLayout({children, showOn}: PropsWithChildren<ConditionallyHiddenLayoutProps>) {
	if (typeof showOn === 'boolean' && showOn) {
		return <>{children}</>
	} else {
		return <></>
	}
}