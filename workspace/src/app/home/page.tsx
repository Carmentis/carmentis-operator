'use client';

import { useState } from 'react';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';
import AvatarOrganisation from '@/components/AvatarOrganisation';
import Image from 'next/image';
import {
	Box,
	Button,
	Card,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	InputAdornment,
	Paper,
	TextField, Tooltip,
	Typography,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import { useModal } from 'react-modal-hook';
import {
	useCreateOrganisationMutation,
	useGetAllApplicationsQuery,
	useGetAllUsersQuery,
	useGetOrganisationsQuery,
} from '@/generated/graphql';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import Avatar from 'boring-avatars';
import GridViewIcon from '@mui/icons-material/GridView';
import useOrganisationPublicationStatus from '@/hooks/useOrganisationPublicationStatus';

export default function HomePage() {
	return (
		<Box display={"flex"} flexDirection={"column"} gap={10}>
			<Grid container width={"100%"}>
				<Grid size={12} mt={5}>
					<Welcome/>
				</Grid>
			</Grid>

			<Box>
				<Box mb={2}>
					<Typography variant={"h5"} color={"primary"}>Your organisations</Typography>
				</Box>
				<Grid container width={"100%"}>
					<Grid container spacing={2}>
						<Grid size={3}>
							<Card>
								<CreateYourOrganisation/>
							</Card>
						</Grid>
						<ListOfOrganisations/>
					</Grid>
				</Grid>
			</Box>

			<Grid container width={"100%"} spacing={2}>
				<Grid size={3}>
					<Box>
						<Box mb={2}>
							<Typography variant={"h5"} color={"primary"}>Your users</Typography>
						</Box>
						<Grid container width={"100%"}>
							<Grid size={10}>
								<Card >
									<ManageYourUsers/>
								</Card>
							</Grid>
						</Grid>
					</Box>
				</Grid>
				<Grid size={9}>
					<Box>
						<Box mb={2}>
							<Typography variant={"h5"} color={"primary"}>Your applications</Typography>
						</Box>
						<Grid container width={"100%"} spacing={2}>
							<ListOfApplications/>
						</Grid>
					</Box>
				</Grid>
			</Grid>



		</Box>
	);
}

function Welcome() {
	return <Box display={"flex"} flexDirection={"column"} gap={2}>
		<Image src={"/carmentis.svg"} alt={"carmentis"} width={30} height={30}/>
		<Typography variant={"h4"}>Welcome to your Workspace</Typography>
		<Typography variant={"body1"} color={"text.secondary"}>
			The workspace is used to manage your organisations, applications and nodes.
		</Typography>
	</Box>
}

function CreateYourOrganisation() {
	const [name, setName] = useState("");
	const [createOrganisationMutation, {loading: isCreatingOrganisation}] = useCreateOrganisationMutation();
	const navigation = useApplicationNavigationContext();
	const notify = useToast();

	function createOrganisation(name: string) {
		if (!name.trim()) {
			notify.error("Organisation name cannot be empty");
			return;
		}

		createOrganisationMutation({ variables: { name } })
			.then(({data}) => {
				if (data && data.createOrganisation) {
					notify.success("Organisation created successfully");
					navigation.navigateToOrganisation(data.createOrganisation.id);
				}
			}).catch(notify.error);
	}
	const [showModal, hideModal] = useModal(() => (
		<Dialog open={true} maxWidth="sm" fullWidth>
			<DialogTitle>Create New Organisation</DialogTitle>
			<DialogContent>
				<Box mt={2}>
					<TextField
						size="small"
						fullWidth
						autoFocus
						label="Organisation Name"
						placeholder="Enter organisation name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button
					onClick={() => hideModal()}
					variant="outlined"
					color="inherit"
				>
					Cancel
				</Button>
				<Button
					onClick={() => { createOrganisation(name); hideModal(); }}
					variant="contained"
					disabled={isCreatingOrganisation || !name.trim()}
				>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	), [name, isCreatingOrganisation]);


	return <Box>
		<Typography variant={"h6"} color={"primary"}>
			Create an organisation
		</Typography>
		<Typography>
			Create an organisation to manage your applications and nodes.
		</Typography>
		<Box mb={3}/>
		<Button
			variant="contained"
			onClick={showModal}
			disabled={isCreatingOrganisation}
			startIcon={<AddIcon />}
			sx={{
				borderRadius: 2,
				textTransform: 'none',
				px: 2
			}}
		>
			New Organisation
		</Button>
	</Box>

}

function ListOfOrganisations() {
	const {data, loading} = useGetOrganisationsQuery();
	const navigation = useApplicationNavigationContext();

	function onClick(organisationId: number) {
		navigation.navigateToOrganisation(organisationId);
	}



	function renderLoadingState() {
		return (
			<>
				{[1, 2, 3, 4, 5, 6].map(i => (
					<Grid size={3}  key={i}>
						<Skeleton height={120} />
					</Grid>
				))}
			</>
		);
	}

	let content;
	if (loading || !data) {
		content = renderLoadingState();
	} else {
		const organisations = data.organisations;
		const filteredOrgs = organisations;

		if (filteredOrgs.length === 0) {
			content = (
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					py={8}
					textAlign="center"
				>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No organisations found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Create your first organisation to get started
					</Typography>
				</Box>
			);
		} else {
			content = (
				<>
					{
						organisations.map(organisation =>
							<Grid size={4} key={organisation.id} >
								<Card>
									<Box display="flex" alignItems="center" gap={2} mb={1}>
										<AvatarOrganisation organisationId={organisation.id} width={32} height={32} />
										<Typography variant="h5">
											{organisation.name}
										</Typography>
									</Box>
									<Typography variant={"body1"}>
										This organisation has been created at {new Date(organisation.createdAt).toLocaleString()}.
									</Typography>
									<OrganisationPublicationStatusMessage virtualBlockchainId={organisation.virtualBlockchainId}/>
									<Box mt={2} display={"flex"} gap={1}>
										<Button variant={"contained"} onClick={() => onClick(organisation.id)}>Access</Button>
										<Button onClick={() => navigation.navigateToOrganisationApplications(
											organisation.id
										)}>
											Apps
										</Button>
										<Button  onClick={() => navigation.navigateToOrganisationNodes(
											organisation.id
										)}>
											Nodes
										</Button>
										<Button  onClick={() => navigation.navigateToOrganisationMembers(
											organisation.id
										)}>
											Members
										</Button>
									</Box>
								</Card>

							</Grid>
						)
					}
				</>
			);
		}
	}

	return content;
}


function OrganisationPublicationStatusMessage({virtualBlockchainId}: {virtualBlockchainId: string}) {
	const {published, virtualBlockchainId: vbId, loading } =  useOrganisationPublicationStatus({virtualBlockchainId});
	if (typeof published !== 'boolean' || loading) return <>Loading...</>
	return <>
		{
			published &&
			<Typography>
				You organisation is published on the blockchain
				at <Tooltip title={virtualBlockchainId}>
				<Typography component={"span"} fontWeight={"bold"}>
					{virtualBlockchainId.slice(0,20)}...{virtualBlockchainId.slice(-4)}.
				</Typography>
			</Tooltip>
			</Typography>
		}
		{
			!published &&
			<Typography>
				You organisation is currently not published on the blockchain.
			</Typography>
		}
		</>
}


function ManageYourUsers() {
	return <Box>
		<Typography variant={"h6"} color={"primary"}>
			Manage your users
		</Typography>
		<Typography>
			Add or remove users from the workspace before to add them in organisations.
		</Typography>
		<Box mb={3}/>
		<Button
			variant="contained"
			sx={{
				borderRadius: 2,
				textTransform: 'none',
				px: 2
			}}
		>
			Manage
		</Button>
	</Box>
}


function ListOfApplications() {
	const navigation = useApplicationNavigationContext();
	const {data, loading, error} = useGetAllApplicationsQuery();
	if (loading || !data) return <Skeleton/>
	return <>
		{
			data.getAllApplications.map(application =>
				<Grid size={6}>
					<Card>
						<Box display={"flex"} alignItems={"center"} gap={1}>
							<GridViewIcon/>
							<Typography variant={"h6"}>{application.name}</Typography>
						</Box>

						<Typography >
							Your application <Typography component={"span"} fontWeight={"bold"}>{application.name}</Typography> has been created at {new Date(application.createdAt).toLocaleString()}.
							{
								application.virtualBlockchainId &&
								<Typography component={"span"}>
									You application is published on the blockchain at
									<Typography component={"span"} fontWeight={"bold"}>{application.virtualBlockchainId}.</Typography>
								</Typography>
							}
							{
								!application.virtualBlockchainId &&
								<Typography component={"span"}>
									You application is currently not published on the blockchain.
								</Typography>
							}
						</Typography>

						<Box mt={2}/>
						<Box display={"flex"} gap={1}>
							<Button variant={"contained"} onClick={() => navigation.navigateToApplication(
								application.organisationId,
								application.id
							)}>
								Access
							</Button>

						</Box>


					</Card>
				</Grid>
			)
		}
	</>
}

function ListOfUsers() {
	const {data: users, loading, error} = useGetAllUsersQuery();
	if (loading || !users) return <></>
	return users.getAllUsers.map(user =>
		<Card sx={{width: 200, height:200}}>
			<Box display={"flex"} flexDirection={"column"} alignContent={"center"} alignItems={"center"} width={"100%"} gap={2}>
				<Avatar name={user.publicKey} size={48} variant={"beam"}/>
				<Typography variant={"h5"}>{user.firstname} {user.lastname}</Typography>
			</Box>
			<Box>
				{
					user.isAdmin &&
					<Typography>This user is an administrator of the workspace.</Typography>
				}
				{
					!user.isAdmin &&
					<Typography>This user is not an administrator of the workspace.</Typography>
				}
			</Box>
		</Card>
	)
}