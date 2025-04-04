'use client';

import {
	useConfirmOrganisationPublicationOnChain,
	useErasePublicationInformation,
	useFetchOrganisationStats,
	useOrganisationPublication,
	useOrganisationUpdateApi,
} from '@/components/api.hook';
import { Box, Button, Chip, IconButton, TextField, Typography } from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import WelcomeCards from '@/components/welcome-cards.component';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import AvatarOrganisation from '@/components/avatar-organisation';
import { useConfirmationModal } from '@/contexts/popup-modal.component';


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

	const { applicationsNumber, usersNumber } = organisationStats.data;

	const welcomeCardData = [
		{ icon: 'bi-currency-dollar', title: 'Balance', value: <OrganisationAccountBalance organisation={organisation}/> },
		{ icon: 'bi-layers', title: 'Applications', value: applicationsNumber.toString() },
		{ icon: 'bi-people', title: 'Users', value: usersNumber.toString() },
		{ icon: 'bi-people', title: 'Version', value: organisation.version.toString() },
	]


	return <div className={"mb-8"}>
		<WelcomeCards items={welcomeCardData}/>
	</div>
}


export default function Home() {
	const organisation = useOrganisationContext();

	return (
		<>
			<Box display="flex" justifyContent="space-between">
				<Box display={'flex'} flexDirection={'row'} justifyContent={"center"} alignItems={"center"} gap={3}>
					<AvatarOrganisation organisationId={organisation.publicSignatureKey || organisation.id}
										className={'w-16 h-16 mb-2'} />
					<Typography variant={'h4'} fontWeight={"bolder"} className={'text-primary-dark'}>{organisation.name}</Typography>
				</Box>

				<div id="actions" className={'mt-4'}>
					<IconButton
						onClick={() => window.open(organisation.website, '_blank')}
						className={'flex space-x-2 bg-primary-light'}>
						<i className="bi bi-globe large-icon"
						   title="Go to website"></i>
					</IconButton>
				</div>
			</Box>
			<div className="w-full">

				<OverviewOrganisationWelcomeCards></OverviewOrganisationWelcomeCards>

				<OrganisationEdition />
			</div>
		</>
	);
}


function OrganisationEdition() {
	const organisation = useOrganisationContext();
	const [name, setName] = useState(organisation.name);
	const [city, setCity] = useState(organisation.city);
	const [countryCode, setCountryCode] = useState(organisation.countryCode);
	const [website, setWebsite] = useState(organisation.website);
	const [isModified, setIsModified] = useState(false);
	const notify = useToast();

	const refreshOrganisation = useOrganisationMutationContext();
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
			website
		}, {
			onSuccess: () => {
				setIsModified(false);
				notify.info("Organisation updated successfully");
				refreshOrganisation.mutate();
			},
			onError: (e) => {
				console.error(e)
				notify.error(e)
			}
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
	return <>
		<div className="header flex justify-between">
			<div className="flex flex-col mb-8">
				<Typography variant="h5">
					Overview
				</Typography>
				<div className="chips flex flex-row space-x-2">
					{organisation.isDraft && <Chip label={'Draft'} variant={'outlined'}
												   className={'border-primary-light text-primary-light'} />}
					{organisation.published &&
						<Chip label={`Published - ${new Date(organisation.publishedAt).toLocaleString()}`}
							  variant={'filled'} className={'bg-primary-light'} />}
					<ChipOnChainPublicationChecker />
				</div>
			</div>


			<div className="">
				{isModified && <Button variant={"contained"} className={'flex space-x-2 bg-primary-light'} onClick={save}>
					<i className={'bi bi-floppy-fill'}></i>
					<span>Save</span>
				</Button>}

				{!isModified && organisation.isDraft &&
					<Button variant={"contained"} className={'flex space-x-2 bg-primary-light'} onClick={publish}>
						<i className={'bi bi-floppy-fill'}></i>
						<span>Publish</span>
					</Button>}
			</div>
		</div>


		<Box display={"flex"} flexDirection={"column"} gap={2}>
			<TextField
				size={"small"}
				value={name}
				label={'Name'}
				onChange={e => {
					setIsModified(true);
					setName(e.target.value);
				}}
			/>

			<TextField
				size={"small"}
				value={countryCode}
				label={'Coutry code'}
				onChange={e => {
					setIsModified(true);
					setCountryCode(e.target.value);
				}}
			/>
			<TextField
				size={"small"}
				value={city}
				label={'City'}
				onChange={e => {
					setIsModified(true);
					setCity(e.target.value);
				}}
			/>
			<TextField
				size={"small"}
				value={website}
				label={'Website'}
				onChange={e => {
					setIsModified(true);
					setWebsite(e.target.value);
				}}
			/>

			<TextField
				size={"small"}
				value={organisation.publicSignatureKey}
				label={'Public key'}
				disabled
			/>

			<TextField
				size={"small"}
				value={organisation.virtualBlockchainId || ''}
				label={'Virtual blockchain ID'}
				disabled
			/>

		</Box>
	</>
}

function ChipOnChainPublicationChecker() {
	const toast = useToast();
	const organisation = useOrganisationContext();
	const mutate = useOrganisationMutationContext();
	const checkResponse = useConfirmOrganisationPublicationOnChain(organisation);
	const synchronisation = useErasePublicationInformation();
	const confirmationModal = useConfirmationModal();

	function synchronise() {
		synchronisation(organisation.id, {
			onSuccess: () => {
				mutate.mutate();
				toast.success('Organisation updated');
			},
			onError: (e) => toast.error(`Organisation updated failed: ${e}`),
		});
	}

	useEffect(() => {
		checkResponse.mutate();
	}, [organisation, checkResponse.mutate]);

	function openConfirmationModal() {
		confirmationModal(
			'Blockchain Inconsistency Detected',
			'It seems that the current organisation has not been found on the blockchain. This indicates an ' +
			'inconsistency between the current state of the blockchain and the workspace. You can resolve this issue by synchronising the workspace with the blockchain. This will erase ' +
			'the previous publication status.',
			'Synchronise',
			'Cancel',
			() => synchronise(),
		);
	}

	let content = <></>;
	if (checkResponse.data) {
		const published = checkResponse.data.published;
		if (!published && (organisation.published || organisation.virtualBlockchainId)) {
			content = <>
				<Chip
					label={`Organisation not on-chain`}
					variant={'filled'}
					className={'bg-deep-orange-400 hover:cursor-pointer'}
					onClick={openConfirmationModal}
				/>

			</>;
		}
	}
	return content;
}
