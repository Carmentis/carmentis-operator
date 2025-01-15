import { Input, Typography } from '@material-tailwind/react';

export default function OverviewInput(
	input: {
		label: string,
		value: string,
		onChange: (value: string) => void
	},
) {
	return <div className={'flex flex-col space-y-4 w-3/12'}>
		<Typography variant="h6" color="blue-gray" className="-mb-3">
			{input.label}
		</Typography>
		<Input
			value={input.value}
			onChange={(e) => input.onChange(e.target.value)}
			className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
		/>
	</div>;
}