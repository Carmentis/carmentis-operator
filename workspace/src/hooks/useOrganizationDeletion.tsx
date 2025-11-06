import { useConfirmationModal } from '@/contexts/popup-modal.component';
import { useDeleteOrganisationMutation } from '@/generated/graphql';
import { useToast } from '@/app/layout';
import { useRouter } from 'next/navigation';

export function useOrganizationDeletion() {
	const toast = useToast();
	const navigation = useRouter();
	const [deleteOrganisationMutation, { loading: isDeleting }] = useDeleteOrganisationMutation();
	const confirmModal = useConfirmationModal();

	async function deleteOrganization(orgId: number) {
		try {
			await deleteOrganisationMutation({
				variables: {
					id: orgId,
				}
			});
			toast.success('Organization deletion successfully.');
			navigation.push("/home");
		} catch (e) {
			console.error(e);
		}
	}

	const deleteOrg = (orgId: number) => {
		confirmModal(
			"Delete organization",
			"Are you sure you want to delete this organization?",
			"Yes",
			"No",
			() => {
				deleteOrganization(orgId);
			}
		)
	}

	return { deleteOrg, isDeleting };
}