'use client';

import {
	Box,
	Button,
	Chip,
	IconButton,
	TextField,
	Typography,
	Menu,
	MenuItem,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import WelcomeCards from '@/components/welcome-cards.component';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import AvatarOrganisation from '@/components/avatar-organisation';
import {
	useChangeOrganisationKeyMutation, GetOrganisationQuery,
	useGetOrganisationStatisticsQuery,
	usePublishOrganisationMutation,
	useUpdateOrganisationMutation,
} from '@/generated/graphql';
import { useModal } from 'react-modal-hook';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as sdk from '@cmts-dev/carmentis-sdk/client';


/**
 * The WelcomeCards function fetches organisation statistics and displays them in a set of styled cards.
 * Each card represents key metrics such as Balance, Applications, Oracles, and Users.
 * If data is still loading, a skeleton loader is displayed.
 */
function OverviewOrganisationWelcomeCards() {
	const organisation  = useOrganisation();
	const {data: statistics, loading, error} = useGetOrganisationStatisticsQuery({
		variables: {
			id: organisation.id
		}
	});

	if (loading) return <Skeleton count={1} />;
	if (!statistics || error) return <Typography>{error.message}</Typography>

	const welcomeCardData = [
		{ icon: 'bi-currency-dollar', title: 'Balance', value: <OrganisationAccountBalance/> },
		{ icon: 'bi-layers', title: 'Applications', value: statistics.getOrganisationStatistics.numberOfApplications.toString() },
		{ icon: 'bi-people', title: 'Users', value:  statistics.getOrganisationStatistics.numberOfUsers.toString() },
	]


	return <div className={"mb-8"}>
		<WelcomeCards items={welcomeCardData}/>
	</div>
}

function PrivateKeyModal(props: {close: () => void}) {
	const organisation = useOrganisation();
	const [publicKey, setPublicKey] = useState<string>('');
	const notify = useToast();
	const [changePrivateKey, {loading: isChanging}] = useChangeOrganisationKeyMutation({
		refetchQueries: [
			{ query: GetOrganisationQuery }
		]
	});

	const privateKeySchema = z.object({
		privateKey: z
			.string()
			.min(64, { message: 'Private key must be at least 64 characters long' })
			.max(64, { message: 'Private key must be 64 characters long' })
			.regex(/^[a-fA-F0-9]+$/, { message: 'Private key must be in hexadecimal format' }),
	});
	type FormData = z.infer<typeof privateKeySchema>;

	const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
		resolver: zodResolver(privateKeySchema),
		disabled: isChanging
	});

	function handleSubmission(data: FormData) {
		changePrivateKey({
			variables: { organisationId: organisation.id, privateKey: data.privateKey },
		}).then(result => {
			const { errors } = result;
			if (errors) {
				notify.error(errors)
			} else {
				notify.info("Key pair changed")
				props.close()
			}
		}).catch(notify.error)
	}


	// we update the public key when the private key is modified
	const privateKey = watch("privateKey")
	useEffect(() => {
		try {
			const sk = privateKey
			const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk)
			setPublicKey(pk)
		} catch {
			setPublicKey('')
		}
	}, [privateKey]);


	return  <Dialog open={true} onClose={() => props.close()}>
		<DialogTitle>
			Change Key Pair
		</DialogTitle>
		<DialogContent>
			
			<Box component={"form"} display={"flex"} flexDirection={"column"} gap={2} onSubmit={handleSubmit(handleSubmission)}>
				<Typography>
					Provide the private signature key (in hex format) of your choice.
				</Typography>
				<TextField size={"small"} label="Private key" type={"password"} error={errors.privateKey ? true: false} helperText={errors.privateKey && errors.privateKey.message} {...register('privateKey')} />
				<TextField size={"small"} label="Public key" disabled={true}  value={publicKey} />

				<Button variant={"contained"} type={"submit"}>Change</Button>
			</Box>
		</DialogContent>

	</Dialog>
}

export default function Home() {
	const organisation = useOrganisation();
	const [showPrivateKeyModal, hidePrivateKeyModal] = useModal(
		() => <PrivateKeyModal close={hidePrivateKeyModal}/>
	);


	function changePrivateKey() {
		showPrivateKeyModal()
	}

	return (
		<>
			<Box display="flex" justifyContent="space-between">
				<Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} gap={3}>
					<AvatarOrganisation organisationId={organisation.publicSignatureKey || organisation.id}
										className={'w-16 h-16 mb-2'} />
					<Typography variant={'h4'} fontWeight={'bolder'}
								className={'text-primary-dark'}>{organisation.name}</Typography>
				</Box>
				<OrganisationMenu
					changePrivateKey={changePrivateKey}
				/>
			</Box>
			<div className="w-full">
				<OverviewOrganisationWelcomeCards />
				<OrganisationEdition />
			</div>
		</>
	);
}

type OrganisationMenuProps = {
	changePrivateKey: () => void
}
function OrganisationMenu(props: OrganisationMenuProps) {
	const organisation = useOrganisation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	function changeKey() {
		handleClose()
		props.changePrivateKey()
	}



	return (

		<div>
			<IconButton
				id="basic-button"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<i className={"bi bi-three-dots-vertical size-small"}/>
			</IconButton>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				<MenuItem onClick={() => window.open(organisation.website, '_blank')}>Visit website</MenuItem>
				<MenuItem onClick={changeKey}>Change key</MenuItem>
			</Menu>
		</div>
	);

}


function OrganisationEdition() {
	const organisation = useOrganisation();
	const [name, setName] = useState(organisation.name);
	const [city, setCity] = useState(organisation.city);
	const [countryCode, setCountryCode] = useState(organisation.countryCode);
	const [website, setWebsite] = useState(organisation.website);
	const [isModified, setIsModified] = useState(false);
	const refreshOrganisation = useOrganisationMutationContext();
	const notify = useToast();
	const [callOrganisationUpdate] = useUpdateOrganisationMutation({
		refetchQueries: ['organisation'],
	});
	const [callOrganisationPublication] = usePublishOrganisationMutation({
		refetchQueries: ['organisation'],
	});

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
			variables: {
				id: organisation.id,
				name: name,
				city: city,
				countryCode,
				website
			}
		}).then(() => {
			refreshOrganisation.mutate()
			setIsModified(false);
			notify.info("Organisation updated successfully");
		}).catch(e => {
			notify.error(e)
		})
	}

	function publish() {
		callOrganisationPublication({
			variables: { organisationId: organisation.id }
		})
			.then(() => notify.info("Organisation published successfully"))
			.catch(notify.error)
	}

	if ( !organisation ) return <Skeleton count={1} height={200}/>
	return <>
		<div className="header flex justify-between">
			<div className="flex flex-col mb-8">
				<Typography variant="h5" fontWeight={"bolder"}>
					Overview
				</Typography>
				<div className="chips flex flex-row space-x-2">
					{
						organisation.isDraft &&
						<Chip
							label={'Draft'}
							variant={'outlined'}
							className={'border-primary-light text-primary-light'}
						/>
					}
					{
						organisation.published &&
						<Chip
							label={`Published - ${new Date(organisation.publishedAt).toLocaleString()}`}
							variant={'filled'}
							className={'bg-primary-light'}
						/>
					}
				</div>
			</div>


			<div className="">
				{
					isModified &&
					<Button
						variant={"contained"}
						className={'flex space-x-2 bg-primary-light'}
						onClick={save}>
						<i className={'bi bi-floppy-fill'}></i>
						<span>Save</span>
					</Button>
				}
				{
					!isModified && organisation.isDraft &&
					<Button
						variant={"contained"}
						className={'flex space-x-2 bg-primary-light'}
						onClick={publish}>
							<i className={'bi bi-floppy-fill'}></i>
							<span>Publish</span>
					</Button>
				}
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
