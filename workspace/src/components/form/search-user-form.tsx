import { UserSearchResult } from '@/entities/user.entity';
import { ReactNode, useState } from 'react';
import Spinner from '@/components/spinner';
import { Box, TextField } from '@mui/material';
import { useSearchUserQuery } from '@/generated/graphql';
import { useToast } from '@/app/layout';

export function SearchUserInputComponent(
	input: {
		formatUserSearchResult: (result: UserSearchResult) => ReactNode
		onSelectedUser: (user: UserSearchResult) => void
	}
) {
	const notify = useToast();
	const [searchInput, setSearchInput] = useState('');
	const {data: users, loading: isLoading, error} = useSearchUserQuery({
		variables: { search: searchInput },
	})

	function selectUser(user: UserSearchResult) {
		input.onSelectedUser(user)
	}

	// the current content for searched users
	let searchResultsContent = <></>;
	if ( isLoading ) {
		searchResultsContent = <div className={"mt-4"}>
			<Spinner></Spinner>
		</div>
	}
	if (error) {
		notify.error(error)
	}
	if ( !isLoading && users && users.searchUser.length !== 0 ) {
		searchResultsContent = <div>
			<ul className="max-h-44 h-44 overflow-y-auto">
				{
					users.searchUser.map((user, index) => {
						return <div key={index} onClick={() => selectUser(user)}>
							{input.formatUserSearchResult(user)}
						</div>
					})
				}
			</ul>
		</div>
	}


	return <Box minHeight={"300px"} maxHeight={"300px"} overflow="scroll">
		<TextField size={"small"} fullWidth={true} label="Search user" value={searchInput} onChange={e => setSearchInput(e.target.value)}/>
		{searchResultsContent}
	</Box>;
}
