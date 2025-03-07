'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	useApplicationDeletionApi,
	useApplicationPublicationApi,
	useApplicationUpdateApi,
} from '@/components/api.hook';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
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
import EntityStatusHeader from '@/components/application-oracle-header';


export type ApplicationDetailsNavbarProps = {
	refreshApplication: () => void
}
export default function ApplicationDetailsNavbar(
	{refreshApplication}: ApplicationDetailsNavbarProps
) {
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const application = useAtomValue(applicationAtom);
	const setReferenceApplication = useSetAtom(referenceApplicationAtom);
	const isModified = useApplicationEditionStatus();
	const callApplicationUpdate = useApplicationUpdateApi();
	const callApplicationDeletion = useApplicationDeletionApi();
	const callApplicationPublish = useApplicationPublicationApi();
	const router = useRouter();
	const notify = useToast();
	const [isApplicationSaving, setApplicationSaving] = useState(false);
	const confirmModal = useConfirmationModal();

	const saveApplication = () => {
		setApplicationSaving(true);
		callApplicationUpdate(organisationId, application, {
			onSuccess: () => {
				refreshApplication()
				setApplicationSaving(false);
				setReferenceApplication(application);
				notify.info('Application saved');
			},
			onError: (error) => {
				notify.error(error);
				setApplicationSaving(false);
			},
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
		confirmModal(
			'Delete Application',
			'This action cannot be undone.',
			'Delete',
			'Cancel',
			() => {
				callApplicationDeletion(organisationId, application.id, {
					onSuccess: () => {
						notify.info('Application deleted');
						router.replace(`/home/organisation/${organisationId}/application`);
					},
					onError: (error) => {
						notify.error(error);
					},
				});
			}
		)
	};

	function publishApplication() {
		confirmModal(
			'Publish Application',
            'This action cannot be undone.',
            'Publish',
            'Cancel',
            () => {
				callApplicationPublish(organisationId, application, {
					onSuccess: () => {
						refreshApplication()
						notify.info('Application published');
					},
					onError: (error) => {
						notify.error(error);
					},
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
		delete={deleteApplication}
		download={downloadApplicationAsJson}
		publish={publishApplication}
	/>


}