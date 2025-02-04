'use client';

import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { BaseSyntheticEvent, useRef, useState } from 'react';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import {
	useApplicationCreation,
	useApplicationImport,
	useFetchOrganisationApplications,
} from '@/components/api.hook';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DynamicAppIcon } from '@/components/icons/default-user.icon';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import Skeleton from 'react-loading-skeleton';
import { ApplicationSummary } from '@/entities/application.entity';

/**
 * Component representing a horizontal card for an application.
 */
function ApplicationHorizontalCard({ application, className }: {
	application: ApplicationSummary;
	className?: string;
}) {
	return (
		<Card
			className={`w-72 h-72 hover:shadow-xl transition-shadow cursor-pointer ${className} items-center justify-center`}
		>
			<CardBody>
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
	data: ApplicationSummary[];
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
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const notify = useToast();
	const router = useRouter();
	const fileInputRef = useRef(null);

	const { data, isLoading, mutate } = useFetchOrganisationApplications(organisationId);



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




	return (
		<div className="space-y-4">
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
				data={data}
				organisationId={organisationId}
			/>

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
