import { UserSearchResult } from '@/entities/user.entity';
import { ReactNode, useState } from 'react';
import Spinner from '@/components/spinner';
import { Input } from '@material-tailwind/react';
import { useSearchUser } from '@/components/api.hook';
import { Box, TextField } from '@mui/material';

export function SearchUserInputComponent(
	input: {
		formatUserSearchResult: (result: UserSearchResult) => ReactNode
		onSelectedUser: (user: UserSearchResult) => void
	}
) {

	const [searchInput, setSearchInput] = useState('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
	const searchUser = useSearchUser();

	// the function used to search users
	function handleSearch(searchInput: string) {
		setSearchInput(searchInput);

		// if empty search input, clear the results
		if ( searchInput == "" ) {
			setSearchResults([])
			return
		}

		setIsLoading(true);
		searchUser(searchInput, {
			onSuccessData: data => setSearchResults(data),
			onEnd: () => setIsLoading(false)
		})

	}

	function selectUser(user: UserSearchResult) {
		setSearchResults([]);
		input.onSelectedUser(user)
	}

	// the current content for searched users
	let searchResultsContent = <></>;
	if ( isLoading ) {
		searchResultsContent = <div className={"mt-4"}>
			<Spinner></Spinner>
		</div>
	}
	if ( !isLoading && searchResults.length !== 0 ) {
		searchResultsContent = <div>
			<ul className="max-h-44 h-44 overflow-y-auto">
				{
					searchResults.map((user, index) => {
						return <div key={index} onClick={() => selectUser(user)}>
							{input.formatUserSearchResult(user)}
						</div>
					})
				}
			</ul>
		</div>
	}


	return <Box minHeight={"300px"} maxHeight={"300px"} overflow="scroll">
		<TextField size={"small"} fullWidth={true} label="Search user" value={searchInput} onChange={e => handleSearch(e.target.value)} />
		{searchResultsContent}
	</Box>;
}
