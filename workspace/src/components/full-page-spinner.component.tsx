'use client';

import { CircularProgress } from '@mui/material';

type FullSpaceSpinnerProps = {
	label?: string
}

export default function FullSpaceSpinner({label}: FullSpaceSpinnerProps) {
	return <div className={"w-full h-full flex flex-col justify-center items-center"}>
		<CircularProgress className={"mb-2"}/>
		{label}
	</div>
}
