'use client';

import { Spinner } from '@material-tailwind/react';

export default function FullSpaceSpinner() {
	return <div className={"w-full h-full flex justify-center items-center"}>
		<Spinner/>
	</div>
}