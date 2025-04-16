'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import {
	useApplicationEditionStatus,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue, useSetAtom } from 'jotai';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useConfirmationModal } from '@/contexts/popup-modal.component';
import Skeleton from 'react-loading-skeleton';
import { Box, Button, Chip, Typography } from '@mui/material';
import { ArrowUpOnSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import Spinner from '@/components/spinner';
import {
	useDeleteApplicationMutation, usePublishApplicationMutation,
	usePublishOrganisationMutation,
	useUpdateApplicationMutation,
} from '@/generated/graphql';


export type ApplicationDetailsNavbarProps = {
	refreshApplication: () => void
}
export default function ApplicationDetailsNavbar(
	{refreshApplication}: ApplicationDetailsNavbarProps
) {
	const organisation = useOrganisation();
	const organisationId = organisation.id;
	const application = useAtomValue(applicationAtom);
	const setReferenceApplication = useSetAtom(referenceApplicationAtom);
	const isModified = useApplicationEditionStatus();


	const [updateApplication, {loading: isUpdating}] = useUpdateApplicationMutation();
	const [deleteApplication, {loading: isDeleting}] = useDeleteApplicationMutation();
	const [publishApplication, {loading: isPublishing}] = usePublishApplicationMutation();

	const router = useRouter();
	const notify = useToast();
	const [isApplicationSaving, setApplicationSaving] = useState(false);
	const confirmModal = useConfirmationModal();

	useEffect(() => {
		setApplicationSaving(isUpdating);
	}, [isUpdating]);

	const saveApplication = () => {
		if (!application) return
		updateApplication({
			variables: {
				applicationId: application.id,
				application: {
					name: application.name,
					logoUrl: application.logoUrl,
					website: application.website,
					description: application.description,
				}
			}
		}).then(result => {
			const {data, errors} = result;
			if (data) {
				refreshApplication()
				setApplicationSaving(false);
				setReferenceApplication(application);
				notify.info('Application saved');
			} else if (errors) {
				notify.error(errors)
			}
		})
	};



	const confirmApplicationDeletion = () => {
		confirmModal(
			'Delete Application',
			'This action cannot be undone.',
			'Delete',
			'Cancel',
			() => {
				if (isDeleting) return
				if (!application) return
				deleteApplication({
					variables: { applicationId: application.id }
				}).then(result => {
					const {data, errors} = result;
					if (data) {
						notify.info('Application deleted');
						router.replace(`/home/organisation/${organisationId}/application`);
					} else if (errors)  {
						notify.error(errors)
					}
				})
			}
		)
	};

	function confirmApplicationPublication() {
		confirmModal(
			'Publish Application',
            'This action cannot be undone.',
            'Publish',
            'Cancel',
            () => {
				if (isPublishing) return
				if (!application) return
				publishApplication({
					variables: { applicationId: application.id }
				}).then(result => {
					const {data, errors} = result;
					if ( data ) {
						refreshApplication()
						notify.info('Application published');
					} else if (errors) {
						notify.error(errors)
					}
				})
			}
		)
	}

	if (!application) return <Skeleton/>
	return <EntityStatusHeader
		name={application.name}
		version={application.version}
		published={application.published}
		isDraft={application.isDraft}
		save={saveApplication}
		isSaving={isApplicationSaving}
		isModified={isModified}
		delete={confirmApplicationDeletion}
		publish={confirmApplicationPublication}
	/>


}


type EntityStatusHeaderProps = {
	name: string,
	version: number,
	logoUrl?: string,
	published: boolean,
	isDraft: boolean,
	isModified: boolean,
	isSaving: boolean,
	save: () => void
	delete: () => void
	publish: () => void
}

function EntityStatusHeader(
	input: EntityStatusHeaderProps
) {

	const BORDER_CLASSES = 'border-r-2 border-gray-200';
	const ICON_ROTATION_CLASSES = 'h-5 w-5 transition-transform group-hover:rotate-45';
	return (
		<>
			<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
				<Box display={"flex"} flexDirection={"row"} gap={2}>
					<Typography
						fontWeight={'bold'}
						variant="h5"
					>
						{input.name}
					</Typography>
					<Box display={"flex"} flexDirection={"row"} gap={1}>
						<Chip label={`Version ${input.version}`}/>
						{input.published &&
							<Chip variant="filled" className={"bg-primary-light"} label="Published" />}
						{input.isDraft &&
							<Chip variant="filled" className={"border-primary-light text-primary-light"}
								  label="Draft" />}
					</Box>
				</Box>
				<Box display={"flex"} flexDirection={"row"} gap={1}>
					<div className={`space-x-2 ${BORDER_CLASSES} pr-2 flex flex-row`}>
						{input.isModified && <Button variant={"contained"} onClick={input.save}>
							{input.isSaving ? <Spinner /> : <i className="bi bi-floppy-fill"></i>}
							<span>save</span>
						</Button>}
						{input.isDraft &&
							<Button variant={"contained"} onClick={input.publish}>
								<ArrowUpOnSquareIcon className={ICON_ROTATION_CLASSES} />
								<span>Publish</span>
							</Button>}
					</div>
					<Button variant={"contained"} onClick={input.delete}>
						<TrashIcon className={ICON_ROTATION_CLASSES} />
					</Button>
				</Box>
			</Box>
		</>
	);
}