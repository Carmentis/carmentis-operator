'use client';

import { Spinner } from '@material-tailwind/react';

type FullSpaceSpinnerProps = {
	label?: string
}

export default function FullSpaceSpinner({label}: FullSpaceSpinnerProps) {
	return <div className={"w-full h-full flex flex-col justify-center items-center"}>
		<Spinner className={"mb-2"}/>
		{label}
	</div>
}