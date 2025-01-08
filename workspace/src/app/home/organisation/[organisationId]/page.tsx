'use client';

import {
	fetchOrganisation,
	GetOrganisationResponse,
	useFetchOrganisationStats, useOrganisationPublication,
	useOrganisationUpdateApi,
} from '@/components/api.hook';
import { useParams } from 'next/navigation';
import {
	Button,
	Card,
	CardBody, Chip,
	IconButton, Input,
	Typography,
} from '@material-tailwind/react';
import Avatar from 'boring-avatars';
import Skeleton from 'react-loading-skeleton';
import RecentActivities from '@/app/home/organisation/[organisationId]/activities';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';


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


/**
 * The WelcomeCards function fetches organisation statistics and displays them in a set of styled cards.
 * Each card represents key metrics such as Balance, Applications, Oracles, and Users.
 * If data is still loading, a skeleton loader is displayed.
 *
 * @return {JSX.Element} A React component displaying organisation statistics or a loading skeleton.
 */
function WelcomeCards() {
	const { organisationId: organisationIdParam } = useParams<{ organisationId: string }>();
	const organisationId = parseInt(organisationIdParam);

	const organisationStats = useFetchOrganisationStats(organisationId);
	if (!organisationStats.data || organisationStats.isLoading) {
		return <Skeleton count={1} />;
	}

	const { balance, applicationsNumber, oraclesNumber, usersNumber } = organisationStats.data;

	const welcomeCardData = [
		{ icon: 'bi-currency-dollar', title: 'Balance', value: balance.toString() },
		{ icon: 'bi-layers', title: 'Applications', value: applicationsNumber.toString() },
		{ icon: 'bi-layers', title: 'Oracles', value: oraclesNumber.toString() },
		{ icon: 'bi-people', title: 'Users', value: usersNumber.toString() },
	];

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
		<div key={key} className="w-3/12">
			<WelcomeCard icon={icon} title={title} value={value}></WelcomeCard>
		</div>
	);

	return (
		<div id="welcome" className="flex flex-row space-x-4 mb-8">
			{welcomeCardData.map((card, index) =>
				renderWelcomeCard(card.icon, card.title, card.value, index),
			)}
		</div>
	);
}



function OrganisationEdition(
	input: {
		organisation: GetOrganisationResponse | null,
		refreshOrganisation: () => void,
	}
) {
	const organisation = input.organisation;
	const [name, setName] = useState('');
	const [city, setCity] = useState('');
	const [countryCode, setCountryCode] = useState('');
	const [website, setWebsite] = useState('');
	const [isModified, setIsModified] = useState(false);
	const notify = useToast();
	const callOrganisationPublication = useOrganisationPublication();
	const callOrganisationUpdate = useOrganisationUpdateApi();

	useEffect(() => {
		if (organisation) {
			setName(organisation.name);
			setCity(organisation.city);
			setCountryCode(organisation.countryCode);
			setWebsite(organisation.website);
		}
	}, [organisation]);

	function save() {
		callOrganisationUpdate({
			...organisation,
			name,
			city,
			countryCode,
			website,
		}, {
			onSuccess: () => {
				notify.info("Organisation updated successfully");
				input.refreshOrganisation();
			},
			onError: notify.error
		})
	}

	function publish() {
		if ( !organisation ) return;
		callOrganisationPublication(organisation, {
			onSuccess: () => {
				notify.info("Organisation published successfully");
				input.refreshOrganisation();
			},
			onError: notify.error
		})
	}

	if ( !organisation ) return <Skeleton count={1} height={200}/>
	return <Card>
		<CardBody>
			<div className="header flex justify-between">
				<div className="flex flex-col mb-8">
					<Typography variant="h5"  >
						Overview
					</Typography>
					<div className="chips flex flex-row space-x-2">

						{ organisation.isDraft && <Chip value={"Draft"} variant={"outlined"} className={"border-primary-light text-primary-light"} />}
						{ true && <Chip value={"Published"} variant={"filled"} className={"bg-primary-light"} />}
					</div>
				</div>


				<div className="">
					{isModified && <Button className={"flex space-x-2 bg-primary-light"} onClick={save}>
						<i className={"bi bi-floppy-fill"}></i>
						<span>Save</span>
					</Button>}

					{!isModified && organisation.isDraft&&<Button className={"flex space-x-2 bg-primary-light"} onClick={publish}>
						<i className={"bi bi-floppy-fill"}></i>
						<span>Publish</span>
					</Button>}
				</div>
			</div>


			<div className="fields space-y-4">
				<Input
					value={name}
					label={'Name'}
					onChange={e => {
						setIsModified(true)
						setName(e.target.value);
					}}
				/>

				<Input
					value={countryCode}
					label={'Coutry code'}
					onChange={e => {
						setIsModified(true)
						setCountryCode(e.target.value);
					}}
				/>
				<Input
					value={city}
					label={'City'}
					onChange={e => {
						setIsModified(true)
						setCity(e.target.value);
					}}
				/>
				<Input
					value={website}
					label={'Website'}
					onChange={e => {
						setIsModified(true)
						setWebsite(e.target.value);
					}}
				/>
			</div>
		</CardBody>
	</Card>
}

export default function Home() {
	const params: { organisationId: string } = useParams();
	const organisationId = parseInt(params.organisationId);
	const { data, mutate } = fetchOrganisation(organisationId);

	return (
		<>
			<div className="w-full">
				<div id="welcome-logo" className={'my-12 w-full flex flex-col justify-center items-center'}>
					<Avatar name={data?.name} className={'w-32 h-32 mb-2'} variant={'beam'}></Avatar>
					<Typography variant={'h4'} className={"text-primary-dark"}>{data?.name}</Typography>
				</div>

				<WelcomeCards></WelcomeCards>


				<div className="flex space-x-4">
					<div className="w-8/12">
						<OrganisationEdition
							organisation={data}
							refreshOrganisation={() => mutate()}
						/>
					</div>
					<div id="activities" className={"w-4/12"}>
						<RecentActivities />
					</div>
				</div>
			</div>
		</>
	);
}
