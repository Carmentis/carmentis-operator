import { PropsWithChildren } from 'react';

export interface BackgroundProps {
	color: string
}

export default function Background({children, color}: PropsWithChildren<BackgroundProps>) {
	return <div className={`h-full w-full ${color}`}>
		{children}
	</div>
}

export function GrayBackground({children}: PropsWithChildren) {
	return <Background color={'bg-gray-100'}>
		{children}
	</Background>
}