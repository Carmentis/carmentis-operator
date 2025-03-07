'use client';

import { Button, Card, CardBody, Chip, IconButton, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { BaseSyntheticEvent, useRef, useState } from 'react';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import {
	useApplicationCreation,
	useApplicationDeletionApi,
	useApplicationImport,
	useFetchOrganisationApplications,
} from '@/components/api.hook';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import Skeleton from 'react-loading-skeleton';
import { ApplicationSummary } from '@/entities/application.entity';
import CardTableComponent from '@/components/card-table.component';
import { Container } from '@mui/material';
import { useConfirmationModal } from '@/contexts/popup-modal.component';


/**
 * Component that displays a list of application cards with links.
 */
function ListOfApplicationsComponent({ organisationId, data, deleteApplication }: {
	organisationId: number;
	data: ApplicationSummary[];
	deleteApplication: (applicationId: number) => void;
}) {

	const router = useRouter();
	function visitApplication(appId: number) {
		router.push(`/home/organisation/${organisationId}/application/${appId}`)
	}



	return <CardTableComponent
		data={data}
		onRowClicked={(app) => visitApplication(app.id)}
		extractor={(v, i) => [
			{head: 'Name', value: <Typography>{v.name}</Typography>},
			{head: 'Tag', value: <Typography>{v.tag}</Typography>},
			{head: 'Draft', value: v.isDraft && <Chip value={'Draft'} className={'bg-primary-light w-min'} />},
			{head: 'Published', value: v.published && <Chip value={'Published'} className={'bg-primary-light w-min'} />},
			{head: 'Published at', value: v.publishedAt && <Typography>{new Date(v.publishedAt).toLocaleString()}</Typography>},
			{head: 'Version', value: <Typography>{v.version}</Typography>},
			{head: '', value: <IconButton size={"sm"} onClick={(e) => {
				e.stopPropagation(); deleteApplication(v.id)
			}}><i className={"bi bi-trash-fill"}/></IconButton>}
		]}
	/>
}

/**
 * Main page component that manages the list of applications.
 */
export default function ListOfApplicationsPage() {
	const [search, setSearch] = useState('');
	const [isShowingNameForm, setIsShowingNameForm] = useState(false);
	const createApplication = useApplicationCreation();
	const importApplication = useApplicationImport();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const notify = useToast();
	const router = useRouter();
	const fileInputRef = useRef(null);

	const { data, isLoading, mutate } = useFetchOrganisationApplications(organisationId);


	const deleteApplicationApi = useApplicationDeletionApi();
	const confirmModal = useConfirmationModal();
	function deleteApplication(applicationId: number) {
		confirmModal(
			'Delete Application',
			'This operation cannot be undone',
			'Delete',
			'Cancel',
			() => deleteApplicationApi(organisation.id, applicationId, {
				onSuccess: () => {
					notify.info('Application deleted');
					mutate()
				},
				onError: notify.error
			}),
		)
	}

	function handleImportFileButtonClick() {
		// @ts-expect-error Input file is undefined by default
		fileInputRef.current.click();
	}


	function handleImportFile(event: BaseSyntheticEvent) {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.readAsText(file);
		reader.onloadend = () => {
			const content = reader.result as string;
			importApplication(organisationId, content, {
				onSuccessData: (application: ApplicationSummary) => {
					notify.info(`Application "${application.name}" imported successfully.`);
					mutate()
				},
				onError: (error) => {
					notify.error(error);
				}
			})
		}


	}

	/**
	 * Handles application creation submission.
	 * @param name - The name of the new application.
	 */
	function submitApplicationNameCreation(name: string) {
		createApplication(organisationId, name, {
			onSuccessData: (data) => {
				notify.info(`Application ${data.name} created`);
				router.push(
					`/home/organisation/${organisationId}/application/${data.id}`
				)
			},
			onError: notify.error
		});
		setIsShowingNameForm(false);
	}



	// render while its loading
	if (!data || isLoading) {
		return <Skeleton/>
	}


	let nameForm = <></>;
	if (isShowingNameForm) {
		nameForm = <SimpleTextModalComponent
			label="Application name"
			onSubmit={submitApplicationNameCreation}
			onClose={() => setIsShowingNameForm(false)}
			placeholder="Name"
		/>
	}

	return (
		<Container className="space-y-4">
			<Card>
				<CardBody >
					<div className="flex justify-between mb-4">
						<Typography
							variant="h5"
							color="blue-gray"
							className="justify-center items-center content-center ml-4"
						>
							Applications
						</Typography>
						<div className="space-x-2">
							<Button className={"bg-primary-light"} onClick={() => setIsShowingNameForm(true)}>Create application</Button>
							<Button className={"bg-primary-light"} onClick={() => handleImportFileButtonClick()}>Import application</Button>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							style={{ display: 'none' }}
							onChange={handleImportFile}
						/>
					</div>
						<SearchInputForm searchFilter={search} setSearchFilter={setSearch} />

				</CardBody>
			</Card>



			<ListOfApplicationsComponent
				data={data.filter(app => search === '' || app.name.toLowerCase().includes(search.toLowerCase()))}
				organisationId={organisationId}
				deleteApplication={deleteApplication}
			/>

			{nameForm}
		</Container>
	);
}
