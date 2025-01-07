'use client';

import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { BaseSyntheticEvent, SyntheticEvent, useRef, useState } from 'react';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import {
	CreateApplicationResponse,
	fetchOrganisationApplications,
	useApplicationCreation,
	useApplicationImport, useFetchOrganisationApplications,
} from '@/components/api.hook';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DynamicAppIcon } from '@/components/icons/default-user.icon';
import { useToast, useToastNotification } from '@/app/layout';

/**
 * Component representing a horizontal card for an application.
 */
function ApplicationHorizontalCard({ application, className }: {
	application: { id: number; name: string; logoUrl: string };
	className?: string;
}) {
	return (
		<Card
			className={`w-72 h-72 hover:shadow-xl transition-shadow cursor-pointer ${className} items-center justify-center`}
		>
			<CardBody className={"flex  flex-col justify-center items-center content-center w-full h-full"}>
					<DynamicAppIcon src={application.logoUrl} className={"mb-8"}/>
					<p>{application.name}</p>
			</CardBody>
		</Card>
	);
}

/**
 * Component that displays a list of application cards with links.
 */
function ListOfApplicationsComponent({ organisationId, data }: {
	organisationId: number;
	data: { id: number; name: string }[];
}) {
	return (
		<div className="flex flex-wrap gap-4">
			{data.map((app) => (
				<Link key={app.id} href={`/home/organisation/${organisationId}/application/${app.id}`}>
					<ApplicationHorizontalCard application={app}  />
				</Link>
			))}
		</div>
	);
}

/**
 * Main page component that manages the list of applications.
 */
export default function ListOfApplicationsPage() {
	const [search, setSearch] = useState('');
	const [isShowingNameForm, setIsShowingNameForm] = useState(false);
	const createApplication = useApplicationCreation();
	const importApplication = useApplicationImport();
	const params = useParams<{ organisationId: number }>();
	const organisationId = params.organisationId;
	const notify = useToast();
	const router = useRouter();
	const fileInputRef = useRef(null);

	const { data, mutate } = useFetchOrganisationApplications(params.organisationId);

	const listOfApplicationsContent = data ? (
		<ListOfApplicationsComponent data={data} organisationId={params.organisationId} />
	) : (
		<></>
	);


	function handleImportFileButtonClick() {
		fileInputRef.current.click();
	}

	/**
	 * This function handles the import of files
	 * @param event
	 */
	function handleImportFile(event: BaseSyntheticEvent) {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.readAsText(file);
		reader.onloadend = () => {
			const content = reader.result;
			importApplication(organisationId, content, {
				onSuccessData: (application: CreateApplicationResponse) => {
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
		createApplication(params.organisationId, name, {
			onSuccessData: (data) => {
				notify.info(`Application ${data.name} created`);
				router.push(
					`/home/organisation/${organisationId}/application/${data.id}`
				)
			},
			onError: (error) => console.error(error),
		});
		setIsShowingNameForm(false);
	}

	return (
		<div className="space-y-12">
			<Card>
				<CardBody className="p-3">
					<div className="flex justify-between">
						<Typography
							variant="h5"
							color="blue-gray"
							className="justify-center items-center content-center ml-4"
						>
							Applications
						</Typography>
						<div className="space-x-2">
							<Button onClick={() => setIsShowingNameForm(true)}>Create application</Button>
							<Button onClick={() => handleImportFileButtonClick()}>Import application</Button>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							style={{ display: 'none' }}
							onChange={handleImportFile}
						/>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<Typography variant="h5" color="blue-gray" className="mb-4">
						Search an application
					</Typography>
					<SearchInputForm searchFilter={search} setSearchFilter={setSearch} />
				</CardBody>
			</Card>

			{listOfApplicationsContent}

			{isShowingNameForm && (
				<SimpleTextModalComponent
					label="Application name"
					onSubmit={submitApplicationNameCreation}
					onClose={() => setIsShowingNameForm(false)}
					placeholder="Name"
				/>
			)}
		</div>
	);
}
