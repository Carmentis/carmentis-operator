'use client';

import {
	useFetchOrganisationStats,
	useOrganisationPublication,
	useOrganisationUpdateApi,
} from '@/components/api.hook';
import { Button, Card, CardBody, Chip, IconButton, Input, Typography } from '@material-tailwind/react';
import Avatar from 'boring-avatars';
import Skeleton from 'react-loading-skeleton';
import RecentActivities from '@/app/home/organisation/[organisationId]/activities';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import WelcomeCards from '@/components/welcome-cards.component';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';


/**
 * The WelcomeCards function fetches organisation statistics and displays them in a set of styled cards.
 * Each card represents key metrics such as Balance, Applications, Oracles, and Users.
 * If data is still loading, a skeleton loader is displayed.
 */
function OverviewOrganisationWelcomeCards() {
	const organisation = useOrganisationContext();
	const organisationStats = useFetchOrganisationStats(organisation.id);
	if (!organisationStats.data || organisationStats.isLoading) {
		return <Skeleton count={1} />;
	}

	const { balance, applicationsNumber, oraclesNumber, usersNumber } = organisationStats.data;

	const welcomeCardData = [
		{ icon: 'bi-currency-dollar', title: 'Balance', value: <OrganisationAccountBalance/> },
		{ icon: 'bi-layers', title: 'Applications', value: applicationsNumber.toString() },
		{ icon: 'bi-layers', title: 'Oracles', value: oraclesNumber.toString() },
		{ icon: 'bi-people', title: 'Users', value: usersNumber.toString() },
		{ icon: 'bi-people', title: 'Version', value: organisation.version.toString() },
	]


	return <div className={"mb-8"}>
		<WelcomeCards items={welcomeCardData}/>
	</div>
}



function OrganisationEdition() {
	const organisation = useOrganisationContext();
	const refreshOrganisation = useOrganisationMutationContext();
	const [name, setName] = useState(organisation.name);
	const [city, setCity] = useState(organisation.city);
	const [countryCode, setCountryCode] = useState(organisation.countryCode);
	const [website, setWebsite] = useState(organisation.website);
	const [operatorEndpoint, setOperatorEndpoint] = useState(organisation.operatorEndpoint);
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
			setOperatorEndpoint(organisation.operatorEndpoint)
		}
	}, [organisation]);

	function save() {
		callOrganisationUpdate({
			...organisation,
			name,
			city,
			countryCode,
			website,
			operatorEndpoint
		}, {
			onSuccess: () => {
				setIsModified(false);
				notify.info("Organisation updated successfully");
				refreshOrganisation.mutate();
			},
			onError: notify.error
		})
	}

	function publish() {
		if ( !organisation ) return;
		callOrganisationPublication(organisation, {
			onSuccess: () => {
				notify.info("Organisation published successfully");
				refreshOrganisation.mutate();
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
						{ organisation.isSandbox && <Chip variant="filled" className={"bg-secondary-light"} value="Sandbox" />}
						{ organisation.isDraft && <Chip value={"Draft"} variant={"outlined"} className={"border-primary-light text-primary-light"} />}
						{ organisation.published && <Chip value={`Published - ${new Date(organisation.publishedAt).toLocaleString()}`} variant={"filled"} className={"bg-primary-light"} />}
					</div>
				</div>


				<div className="">
					{isModified && <Button className={"flex space-x-2 bg-primary-light"} onClick={save}>
						<i className={"bi bi-floppy-fill"}></i>
						<span>Save</span>
					</Button>}

					{!isModified && organisation.isDraft &&<Button className={"flex space-x-2 bg-primary-light"} onClick={publish}>
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
						setIsModified(true);
						setName(e.target.value);
					}}
				/>

				<Input
					value={countryCode}
					label={'Coutry code'}
					onChange={e => {
						setIsModified(true);
						setCountryCode(e.target.value);
					}}
				/>
				<Input
					value={city}
					label={'City'}
					onChange={e => {
						setIsModified(true);
						setCity(e.target.value);
					}}
				/>
				<Input
					value={website}
					label={'Website'}
					onChange={e => {
						setIsModified(true);
						setWebsite(e.target.value);
					}}
				/>
				<Input
					value={operatorEndpoint}
					label={'Operator endpoint'}
					onChange={e => {
						setIsModified(true);
						setOperatorEndpoint(e.target.value);
					}}
				/>

				<div className="input">
					<Typography>Public key</Typography>
					<Input
						value={organisation.publicSignatureKey}
						label={'Public key'}
						disabled
					/>
				</div>

				<div className="input">
					<Typography>Virtual blockchain ID</Typography>
					<Input
						value={organisation.virtualBlockchainId}
						label={'Virtual blockchain ID'}
						disabled
					/>
				</div>
			</div>
		</CardBody>
	</Card>
}

export default function Home() {
	const organisation = useOrganisationContext();

	return (
		<>
			<div className="w-full">
				<div id="welcome-logo" className={'my-12 w-full flex flex-col justify-center items-center'}>
					<Avatar name={organisation.name} className={'w-32 h-32 mb-2'} variant={'beam'}></Avatar>
					<Typography variant={'h4'} className={"text-primary-dark"}>{organisation.name}</Typography>

					<div id="actions" className={"mt-4"}>
						<IconButton
							onClick={() => window.open(organisation.website, '_blank')}
							className={"flex space-x-2 bg-primary-light"}>
							<i className="bi bi-globe large-icon"
							   title="Go to website"></i>
						</IconButton>
					</div>
				</div>

				<OverviewOrganisationWelcomeCards></OverviewOrganisationWelcomeCards>


				<div className="flex space-x-4">
					<div className="w-8/12">
						<OrganisationEdition />
					</div>
					<div id="activities" className={"w-4/12"}>
						<RecentActivities />
					</div>
				</div>
			</div>
		</>
	);
}
