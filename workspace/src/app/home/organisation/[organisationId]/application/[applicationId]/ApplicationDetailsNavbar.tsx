'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue, useSetAtom } from 'jotai';
import { Box, Breadcrumbs, Button, ButtonBase, Chip, Skeleton, Stack, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteIcon from '@mui/icons-material/Delete';
import GridViewIcon from '@mui/icons-material/GridView';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { applicationAtom, referenceApplicationAtom } from './atoms';
import { useConfirmationModal } from '@/contexts/popup-modal.component';
import {
	useDeleteApplicationMutation,
	usePublishApplicationMutation,
	useUpdateApplicationMutation,
} from '@/generated/graphql';
import { useApplicationEditionStatus } from '@/hooks/useApplicationEditionStatus';


interface ApplicationDetailsNavbarProps {
	refreshApplication: () => void;
}

export default function ApplicationDetailsNavbar({ refreshApplication }: ApplicationDetailsNavbarProps) {
	const organisation = useOrganisation();
	const router = useRouter();
	const notify = useToast();
	const confirmModal = useConfirmationModal();

	const application = useAtomValue(applicationAtom);
	const setReferenceApplication = useSetAtom(referenceApplicationAtom);
	const isModified = useApplicationEditionStatus();

	const [updateApplication, { loading: isUpdating }] = useUpdateApplicationMutation();
	const [deleteApplication, { loading: isDeleting }] = useDeleteApplicationMutation();
	const [publishApplication, { loading: isPublishing }] = usePublishApplicationMutation();

	const handleSave = async () => {
		if (!application) return;

		try {
			const result = await updateApplication({
				variables: {
					applicationId: application.id,
					application: {
						name: application.name,
						logoUrl: application.logoUrl,
						website: application.website,
						description: application.description,
					},
				},
			});

			if (result.data) {
				refreshApplication();
				setReferenceApplication(application);
				notify.success('Application saved successfully');
			} else if (result.errors) {
				notify.error(result.errors);
			}
		} catch (error) {
			notify.error(error);
		}
	};

	const handleDelete = () => {
		confirmModal(
			'Delete Application',
			'This action cannot be undone. All data associated with this application will be permanently removed.',
			'Delete',
			'Cancel',
			async () => {
				if (!application) return;

				try {
					const result = await deleteApplication({
						variables: { applicationId: application.id },
					});

					if (result.data) {
						notify.success('Application deleted successfully');
						router.replace(`/home/organisation/${organisation.id}/application`);
					} else if (result.errors) {
						notify.error(result.errors);
					}
				} catch (error) {
					notify.error(error);
				}
			}
		);
	};

	const handlePublish = () => {
		confirmModal(
			'Publish Application',
			'This action will register the application on the blockchain. This cannot be undone.',
			'Publish',
			'Cancel',
			async () => {
				if (!application) return;

				try {
					const result = await publishApplication({
						variables: { applicationId: application.id },
					});

					if (result.data) {
						refreshApplication();
						notify.success('Application published successfully');
					} else if (result.errors) {
						notify.error(result.errors);
					}
				} catch (error) {
					notify.error(error);
				}
			}
		);
	};

	if (!application) {
		return (
			<Box>
				<Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
			</Box>
		);
	}

	return (
		<Stack spacing={2}>
			{/* Breadcrumbs */}
			<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
				<ButtonBase
					onClick={() => router.push(`/home/organisation/${organisation.id}`)}
					sx={{ borderRadius: 1, px: 0.5 }}
				>
					<Typography variant="body2" color="text.secondary">
						{organisation.name}
					</Typography>
				</ButtonBase>
				<ButtonBase
					onClick={() => router.push(`/home/organisation/${organisation.id}/application`)}
					sx={{ borderRadius: 1, px: 0.5 }}
				>
					<Typography variant="body2" color="text.secondary">
						Applications
					</Typography>
				</ButtonBase>
				<Typography variant="body2" color="text.primary">
					{application.name}
				</Typography>
			</Breadcrumbs>

			{/* Header */}
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Box display="flex" alignItems="center" gap={1.5}>
					<GridViewIcon color="primary" />
					<Typography variant="h5" fontWeight={600}>
						{application.name}
					</Typography>
					{application.published && (
						<Chip label="Published" color="success" size="small" />
					)}
					{application.isDraft && (
						<Chip label="Draft" color="default" size="small" />
					)}
				</Box>

				<Stack direction="row" spacing={1}>
					{isModified && (
						<Button
							variant="contained"
							startIcon={<SaveIcon />}
							onClick={handleSave}
							disabled={isUpdating}
						>
							Save
						</Button>
					)}
					{application.isDraft && !isModified && (
						<Button
							variant="contained"
							startIcon={<PublishIcon />}
							onClick={handlePublish}
							disabled={isPublishing}
						>
							Publish
						</Button>
					)}
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={handleDelete}
						disabled={isDeleting}
					>
						Delete
					</Button>
				</Stack>
			</Box>
		</Stack>
	);
}