'use client';

import { useState } from 'react';

import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';
import AvatarOrganisation from '@/components/avatar-organisation';
import { Box, Button, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { SearchInputForm } from '@/components/form/search-input.form';
import Skeleton from 'react-loading-skeleton';
import { Dialog } from '@material-tailwind/react';
import { useModal } from 'react-modal-hook';
import { useCreateOrganisationMutation, useGetOrganisationsQuery } from '@/generated/graphql';


export default function HomePage() {
	const [search, setSearch] = useState("");
	const [name, setName] = useState("");
	const [createOrganisationMutation, {loading: isCreatingOrganisation}] = useCreateOrganisationMutation();
	const navigation = useApplicationNavigationContext();
	const notify = useToast();
	/*
	const [organisationCreationState,createOrganisation] = useAsyncFn(async (organisationName: string) => {
		callOrganisationCreation(organisationName, {
			onSuccessData: (data: {id: number}) => {
				navigation.navigateToOrganisation(data.id)
			},
			onError: notify.error,
		})
	});
	 */

	function createOrganisation(name: string) {
		createOrganisationMutation({ variables: { name } })
			.then(({data}) => {
				if (data && data.createOrganisation) navigation.navigateToOrganisation(data.createOrganisation.id)
			}).catch(notify.error)
	}

	const [showModal, hideModal] = useModal(() => (
		<Dialog open={true}>
			<DialogTitle>Create Organisation</DialogTitle>
			<DialogContent>
				<TextField size={"small"} fullWidth autoFocus value={name} onChange={(e) => setName(e.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={() => hideModal()}>Cancel</Button>
				<Button onClick={() => { createOrganisation(name); hideModal(); }} variant={"contained"}>Create</Button>
			</DialogActions>
		</Dialog>
	), [name]);


	return <>
		<Box display={"flex"} justifyContent={"space-between"}>
			<Typography variant={"h5"} fontWeight={"bold"}>Organisations</Typography>
			<Box display={"flex"} flexDirection={"row"} gap={2}>
				<SearchInputForm searchFilter={search} setSearchFilter={setSearch}/>
				<Button variant={"contained"} onClick={showModal} disabled={isCreatingOrganisation}>
					create organisation
				</Button>
			</Box>
		</Box>
		<ListOfOrganisations search={search}/>
	</>
}

function ListOfOrganisations( props: {search: string} ) {
	const {data, loading} = useGetOrganisationsQuery();
	const navigation = useApplicationNavigationContext();

	function onClick(organisationId: number) {
		navigation.navigateToOrganisation(organisationId);
	}

	function renderOrganisation(organisation: { id: number; name: string; publicSignatureKey: string }) {
		return <Box display={"flex"} justifyContent={"start"}  alignItems={"center"} px={4} py={2} gap={2} className={"hover:cursor-pointer hover:bg-gray-50"} onClick={() => onClick(organisation.id)}>
			<AvatarOrganisation organisationId={organisation.id} width={40} height={40} />
			<Box>
				<Typography variant={"body1"} fontWeight={"bold"}>{organisation.name}</Typography>
				<Typography variant={"body1"} color={"textSecondary"}>Public key: {organisation.publicSignatureKey}</Typography>
			</Box>
		</Box>
	}

	function renderLoadingState() {
		return <Skeleton count={5}/>;
	}

	let content;
	if (loading || !data) {
		content = renderLoadingState()
	} else {
		const organisations = data.organisations;
		const searchLowercase = props.search.toLowerCase();
		content = organisations
			.filter(org => searchLowercase === '' || org.name.toLowerCase().includes(searchLowercase))
			.map(org => renderOrganisation(org));
	}

	return <>
		<Box border={"1px solid #eee"} borderRadius={1} mt={4}>
			{content}
		</Box>
	</>
}