import Card from '@material-tailwind/react/components/Card';
import { PropsWithChildren } from 'react';
import { CardBody } from '@material-tailwind/react';

export interface DefaultCardProps {
	cardClassName?: string,
	bodyClassName?: string,
}
export default function DefaultCard({children, cardClassName, bodyClassName}: PropsWithChildren<DefaultCardProps>) {
	return <Card className={cardClassName}>
		<CardBody className={bodyClassName}>
			{children}
		</CardBody>
	</Card>
}