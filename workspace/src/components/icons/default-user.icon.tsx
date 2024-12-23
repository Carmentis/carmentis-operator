import { useState } from 'react';

export function DefaultIcon(input: {className?: string, icon: string, style?: React.CSSProperties}) {
	return <div
		className={`bg-gray-100 rounded-full p-2 w-12 h-12 items-center justify-center text-center align-middle mb-4 ${input.className}`}>
		<i className={`bi bi-${input.icon} large-icon`}></i>
	</div>
}

export function DefaultUserIcon(input: {className?: string, style?: React.CSSProperties}) {
	return <DefaultIcon icon={"person"} className={input.className} style={input.style} />
}

export function DefaultAppIcon(input: {className?: string, style?: React.CSSProperties}) {
	return <DefaultIcon icon={"boxes"} className={input.className} style={input.style} />
}

export function DynamicAppIcon(input: {
	className?: string
	src: string
}) {

	const [hideLogo, setHideLogo] = useState(true);
	return <div
		className={`rounded-full p-2 w-12 h-12 items-center justify-center text-center align-middle mb-4 ${input.className}`}>
		<img src={input.src} alt="" onLoad={() => setHideLogo(false)} hidden={hideLogo} />
		{hideLogo && <DefaultAppIcon></DefaultAppIcon>}
	</div>
}