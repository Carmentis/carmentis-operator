import { Card, CardBody, CardHeader, IconButton, Typography } from '@material-tailwind/react';

export default function LargeCardEdition(
	{ children, name, onRemove }: Readonly<{
		children: React.ReactNode;
		name: string,
		onRemove: () => void
	}>,
) {
	return <Card className={'border-2 border-gray-800 w-full'}>
		<CardHeader floated={false}
					shadow={false}
					color="transparent"
					className="m-0 rounded-none rounded-t-md p-2 bg-gray-800 flex justify-between">

			<Typography variant={'h6'} color={'white'}>{name}</Typography>
			<IconButton variant={'filled'} color={'white'} size={'sm'}
						onClick={() => onRemove()}
			>
				<i className="bi bi-trash" />
			</IconButton>
		</CardHeader>
		<CardBody className={'flex flex-col space-y-4'}>
			{children}
		</CardBody>
	</Card>;
}
