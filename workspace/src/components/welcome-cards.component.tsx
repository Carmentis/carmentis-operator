import { Card, CardBody, IconButton, Typography } from '@material-tailwind/react';

export type WelcomeCardsProps = {
	items: {icon: string, title: string, value: string}[],
	className?: string
}

/**
 * The WelcomeCard function creates a styled card component displaying a title, value, and icon.
 *
 * @param {string} input.icon - The icon to be displayed on the welcome card.
 * @param {string} input.title - The title to be displayed on the welcome card.
 * @param {string} input.value - The value or content of the welcome card.
 * @returns {JSX.Element} A styled card component displaying a title, value, and icon.
 */
function WelcomeCard(
	input: {
		icon: string,
		title: string,
		value: string,
	},
) {
	return <Card className={'w-full'}>
		<CardBody className={'flex flex-row justify-between p-4 items-center text-center'}>
			<IconButton className={'flex bg-primary-light'}>
				<i className={`bi ${input.icon} text-white font-bold text-lg`}></i>
			</IconButton>

			<div className="flex flex-col justify-end items-end">
				<Typography className={'font-bold text-primary-dark'}>{input.title}</Typography>
				<Typography>{input.value}</Typography>
			</div>
		</CardBody>
	</Card>;
}

export default function WelcomeCards(
	input: WelcomeCardsProps
) {
	/**
	 * Renders a welcome card component wrapped within a container div element.
	 *
	 * @param {string} icon - The icon to be displayed on the welcome card.
	 * @param {string} title - The title to be displayed on the welcome card.
	 * @param {string} value - The value or content of the welcome card.
	 * @param {number} key - A unique key for the rendered parent div element.
	 * @returns {JSX.Element} A JSX element containing the WelcomeCard component inside a wrapper div.
	 */
	const renderWelcomeCard = (icon: string, title: string, value: string, key: number) => (
		<div key={key} className="w-64">
			<WelcomeCard icon={icon} title={title} value={value}></WelcomeCard>
		</div>
	);

	return (
		<div id="welcome" className={`flex flex-wrap gap-4 ${input.className}`}>
			{input.items.map((card, index) =>
				renderWelcomeCard(card.icon, card.title, card.value, index),
			)}
		</div>
	);
}