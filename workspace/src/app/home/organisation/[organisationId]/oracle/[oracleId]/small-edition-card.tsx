import { Card, CardBody, CardHeader, IconButton, Typography } from '@material-tailwind/react';

export default function SmallCardEdition(
	{ children, name, onRemove }: Readonly<{
		children: React.ReactNode;
		name: string,
		onRemove: () => void
	}>,
) {
	return <Card className={' w-72 shadow-lg'}>
		<CardHeader floated={false}
					shadow={false}
					color="transparent"
					className="m-0 rounded-none rounded-t-md bg-blue-gray-100 p-2 flex justify-between items-center">

			<Typography variant={'h6'} color={'white'}>{name}</Typography>

			{/* Icons */}
			<div id="icons" className={'flex gap-2'}>
				<IconButton variant={'filled'} color={'white'} size={'sm'} onClick={() => onRemove()}>
					<i className="bi bi-trash" />
				</IconButton>
			</div>
		</CardHeader>
		<CardBody className={'flex flex-col space-y-3'}>
			{children}
		</CardBody>
	</Card>;
}
