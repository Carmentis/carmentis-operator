'use client';

import { Box, Button, Chip, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import Skeleton from 'react-loading-skeleton';
import GenericTableComponent from '@/components/generic-table.component';
import { useApplicationNavigationContext, useCustomRouter } from '@/contexts/application-navigation.context';
import { SearchInputForm } from '@/components/form/search-input.form';
import useTextFieldFormModal from '@/components/modals/text-form-moda';
import useConfirmationModal from '@/components/modals/confirmation-modal';
import {
	ApplicationSummaryTypeFragment, useCreateApplicationMutation,
	useDeleteApplicationMutation,
	useGetAllApplicationsInOrganisationQuery,
} from '@/generated/graphql';


/**
 * Main page component that manages the list of applications.
 */
export default function ListOfApplicationsPage() {
	const [search, setSearch] = useState('');
	const organisation = useOrganisation();
	const organisationId = organisation.id;
	const notify = useToast();
	const router = useCustomRouter();
	const [createApplication, { loading: isCreating }] = useCreateApplicationMutation();
	const [deleteApplication, { loading: isDeleting }] = useDeleteApplicationMutation();
	const [showDeletionConfirmationModal,setDeletionModalState] = useConfirmationModal<number>({
		title: "Delete application",
		message: "This action cannot be undone",
		yes: 'Delete',
		no: 'Cancel',
		onYes: applicationId => {
			if (isDeleting) return
			deleteApplication({
				variables: { applicationId }
			}).then(() => {
				notify.info('Application deleted');
				mutate()
			}).catch(notify.error)
		}
	})


	const showApplicationCreationModal = useTextFieldFormModal({
		title: "Creation application",
		placeholder: "Name",
		onSubmit: applicationName => {
			if (isCreating) return
			createApplication({
				variables: { organisationId, applicationName },
			}).then(application => {
				const {data} = application;
				notify.info(`Application ${applicationName} created`);
				router.push(`/home/organisation/${organisationId}/application/${data?.createApplicationInOrganisation.id}`)
			}).catch(notify.error)
		}
	})

	const {data, loading: isLoading, refetch: mutate} = useGetAllApplicationsInOrganisationQuery({
		variables: {
			organisationId: organisation.id,
		},
	})


	// render while its loading
	if (!data || isLoading) {
		return <Skeleton/>
	}


	return <>
		<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
			<Typography variant={"h5"} fontWeight={"bold"}>Applications</Typography>
			<Box display={"flex"} gap={2}>
				<SearchInputForm searchFilter={search} setSearchFilter={setSearch} />
				<Button variant={"contained"} onClick={showApplicationCreationModal}>Create application</Button>
			</Box>
		</Box>

		<ListOfApplicationsComponent
			data={data.getAllApplicationsInOrganisation.filter(app => search === '' || app.name.toLowerCase().includes(search.toLowerCase()))}
			organisationId={organisationId}
			deleteApplication={applicationId => {
				setDeletionModalState(applicationId);
				showDeletionConfirmationModal()
			}}
		/>
	</>
}


/**
 * Component that displays a list of application cards with links.
 */
function ListOfApplicationsComponent({ organisationId, data, deleteApplication }: {
	organisationId: number;
	data: ApplicationSummaryTypeFragment[];
	deleteApplication: (applicationId: number) => void;
}) {
	const navigation = useApplicationNavigationContext();

	const router = useCustomRouter();
	function visitApplication(appId: number) {
		navigation.navigateToApplication(organisationId, appId)
		router.push(`/home/organisation/${organisationId}/application/${appId}`)
	}



	return <GenericTableComponent
		data={data}
		onRowClicked={(app) => visitApplication(app.id)}
		extractor={(v, i) => [
			{head: 'Id', value: <Typography>{v.id}</Typography>},
			{head: 'Name', value: <Typography>{v.name}</Typography>},
			{head: 'Draft', value: v.isDraft && <Chip label={'Draft'} className={'bg-primary-light w-min'} />},
			{head: 'Published', value: v.published && <Chip label={'Published'} className={'bg-primary-light w-min'} />},
			{head: 'Published at', value: v.publishedAt && <Typography>{new Date(v.publishedAt).toLocaleString()}</Typography>},
			{head: 'Version', value: <Typography>{v.version}</Typography>},
			{head: '', value: <IconButton  onClick={(e) => {
					e.stopPropagation(); deleteApplication(v.id)
				}}><i className={"bi bi-trash-fill"}/></IconButton>}
		]}
	/>
}