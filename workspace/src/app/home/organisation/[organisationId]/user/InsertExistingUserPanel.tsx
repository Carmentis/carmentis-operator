import { UserSearchResult } from '@/entities/user.entity';
import { Box, ListItem, ListItemText, Typography } from '@mui/material';
import { SearchUserInputComponent } from '@/app/home/organisation/[organisationId]/user/SearchUserInput';

function formatUserItem(user: UserSearchResult) {
	return (
		<ListItem
			button
			sx={{
				borderBottom: '1px solid #f0f0f0',
				transition: 'all 0.2s',
				'&:hover': {
					backgroundColor: 'rgba(0, 0, 0, 0.04)',
				},
			}}
		>
			<ListItemText
				primary={
					<Typography variant="body1" fontWeight="500">
						{user.firstname} {user.lastname}
					</Typography>
				}
				secondary={
					<Typography
						variant="body2"
						sx={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							fontFamily: 'monospace',
							fontSize: '0.75rem',
						}}
					>
						{user.publicKey}
					</Typography>
				}
			/>
		</ListItem>
	);
}

export function InsertExistingUserPanel(
	props: { onClick: (user: UserSearchResult) => void },
) {
	return (
		<Box>
			<Typography variant="h6" fontWeight="500" mb={2}>
				Add Existing User
			</Typography>
			<SearchUserInputComponent
				formatUserSearchResult={formatUserItem}
				onSelectedUser={(user) => props.onClick(user)}
			/>
		</Box>
	);
}