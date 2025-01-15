import { PropsWithChildren } from 'react';

export default function FlexCenter({children}: PropsWithChildren) {
	return <div className={"w-full h-full flex justify-center items-center align-middle"}>
		{children}
	</div>
}