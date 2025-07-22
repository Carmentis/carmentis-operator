import { UserSearchResult } from '@/entities/user.entity';
import { ReactNode, useState } from 'react';
import Spinner from '@/components/Spinner';
import { Box, TextField } from '@mui/material';
import { useSearchUserQuery } from '@/generated/graphql';
import { useToast } from '@/app/layout';

interface SearchUserInputProps {
	formatUserSearchResult: (result: UserSearchResult) => ReactNode;
	onSelectedUser: (user: UserSearchResult) => void;
}

/**
 *
 */
/**
 * A component that provides a user search functionality with real-time input handling
 * and displays the search results. Users can select a search result to trigger a callback.
 *
 * @param {SearchUserInputProps} props - The properties for the SearchUserInputComponent.
 * @param {function} props.formatUserSearchResult - A function to format and render search result items.
 * @param {function} props.onSelectedUser - A callback function triggered when a user is selected from the search results.
 * @return {JSX.Element} The rendered SearchUserInputComponent.
 */
export function SearchUserInputComponent(props: SearchUserInputProps) {
	const { formatUserSearchResult, onSelectedUser } = props;
	const notify = useToast();
	const [searchInput, setSearchInput] = useState('');

	const { data: users, loading: isLoading, error } = useSearchUserQuery({
		variables: { search: searchInput },
	});

	const selectUser = (user: UserSearchResult) => {
		onSelectedUser(user);
	};

	const renderSearchResultsContent = (): ReactNode => {
		if (isLoading) {
			return (
				<div className="mt-4">
					<Spinner />
				</div>
			);
		}

		if (error) {
			notify.error(error);
			return <></>;
		}

		if (users && users.searchUser.length > 0) {
			return (
				<div>
					<ul className="max-h-44 h-44 overflow-y-auto">
						{users.searchUser.map((user, index) => (
							<div key={index} onClick={() => selectUser(user)}>
								{formatUserSearchResult(user)}
							</div>
						))}
					</ul>
				</div>
			);
		}

		return <></>;
	};

	return (
		<Box minHeight="300px" maxHeight="300px" overflow="scroll">
			<TextField
				size="small"
				fullWidth
				label="Search user"
				value={searchInput}
				onChange={(e) => setSearchInput(e.target.value)}
			/>
			{renderSearchResultsContent()}
		</Box>
	);
}