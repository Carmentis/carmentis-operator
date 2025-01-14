'use client';
import { Button, Card, CardBody, Chip, IconButton, Spinner, Typography } from '@material-tailwind/react';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApplicationDeletionApi, useApplicationPublicationApi, useApplicationUpdateApi } from '@/components/api.hook';
import { useToast } from '@/app/layout';
import { Application } from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import { useApplication } from '@/contexts/application-store.context';
import { useEditionStatus, useSetEditionStatus } from '@/contexts/edition-status.context';

const BORDER_CLASSES = 'border-r-2 border-gray-200';
const ICON_ROTATION_CLASSES = 'h-5 w-5 transition-transform group-hover:rotate-45';

function ApplicationHeader({ application, hideLogo, setHideLogo }: {
	application: Application,
	hideLogo: boolean,
	setHideLogo: (state: boolean) => void
}) {
	return (
		<div className="begin-section justify-center items-center content-center flex">
			<div className={`${BORDER_CLASSES} px-2 pr-4 flex`}>
				<img
					src={application.logoUrl}
					alt=""
					className="mr-4 px-0"
					width={15}
					hidden={!application.logoUrl || hideLogo}
					onError={() => setHideLogo(true)}
					onLoad={() => setHideLogo(false)}
				/>
				<Typography
					variant="h5"
					color="blue-gray"
					className="justify-center items-center content-center"
				>
					{application.name}
				</Typography>
			</div>
			<div className={`${BORDER_CLASSES} px-4`}>Version {application.version}</div>
			<div className="px-4 flex flex-row space-x-2">
				{application.published && <Chip variant="filled" className={"bg-primary-light"} value="Published" />}
				{application.isDraft && <Chip variant="outlined" className={"border-primary-light text-primary-light"} value="Draft" />}
			</div>
		</div>
	);
}

export default function ApplicationDetailsNavbar({ refreshApplication }: { refreshApplication: () => void }) {
	const params = useParams();
	const organisationId = parseInt(params.organisationId);
	const application = useApplication();
	const isModified = useEditionStatus();
	const setIsModified = useSetEditionStatus();
	const callApplicationUpdate = useApplicationUpdateApi();
	const callApplicationDeletion = useApplicationDeletionApi();
	const callApplicationPublish = useApplicationPublicationApi();
	const router = useRouter();
	const notify = useToast();
	const [isApplicationSaving, setApplicationSaving] = useState(false);
	const [hideLogo, setHideLogo] = useState(false);

	const saveApplication = () => {
		setApplicationSaving(true);
		callApplicationUpdate(organisationId, application, {
			onSuccess: () => {
				setApplicationSaving(false);
				setIsModified(false);
				notify.info('Application saved');
			},
			onError: (error) => {
				notify.error(error);
				setApplicationSaving(false);
			},
			onEnd: refreshApplication
		});
	};

	const downloadApplicationAsJson = () => {
		const encodedApplication = JSON.stringify(application);
		const jsonBlob = new Blob([encodedApplication], { type: 'application/json' });
		const link = createDownloadLink(
			jsonBlob,
			`application-${application.name}.json`,
		);
		link.click();
		URL.revokeObjectURL(link.href);
		notify.info('Application downloaded');
	};

	const createDownloadLink = (blob: Blob, filename: string): HTMLAnchorElement => {
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		return link;
	};

	const deleteApplication = () => {
		callApplicationDeletion(organisationId, application.id, {
			onSuccess: () => {
				notify.info('Application deleted');
				router.replace(`/home/organisation/${organisationId}/application`);
			},
			onError: (error) => {
				notify.error(error);
			},
		});
	};

	function publishApplication() {
		callApplicationPublish(organisationId, application, {
			onSuccess: () => {
				notify.info('Application published');
				refreshApplication();
			},
			onError: (error) => {
				notify.error(error);
			},
		})
	}

	return (
		<Card>
			<CardBody className="p-3">
				<div className="flex justify-between">
					<ApplicationHeader
						application={application}
						hideLogo={hideLogo}
						setHideLogo={setHideLogo}
					/>
					<div className="flex">
						<div className={`space-x-2 ${BORDER_CLASSES} pr-2 flex flex-row`}>
							{isModified && <Button className={"flex items-center space-x-2"}   onClick={saveApplication} >
								{isApplicationSaving ? <Spinner /> : <i className="bi bi-floppy-fill"></i>}
								<span>save</span>
							</Button>}
							{application.isDraft && <Button className={"flex items-center space-x-2"} onClick={publishApplication}>
								<ArrowUpOnSquareIcon className={ICON_ROTATION_CLASSES} />
								<span>Publish</span>
							</Button>}
							<Button  className={"flex items-center space-x-2"} onClick={downloadApplicationAsJson}>
								<ArrowDownOnSquareIcon className={ICON_ROTATION_CLASSES} />
								<span>Download</span>
							</Button>
						</div>
						<IconButton className="border-l-2 border-gray-200 ml-2" onClick={deleteApplication}>
							<TrashIcon className={ICON_ROTATION_CLASSES} />
						</IconButton>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}