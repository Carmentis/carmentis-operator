import { UserSearchResult } from '@/entities/user.entity';
import { ReactNode, useState } from 'react';
import Spinner from '@/components/spinner';
import { Input } from '@material-tailwind/react';

export function SearchUserInputComponent(
	input: {
		formatUserSearchResult: (result: UserSearchResult) => ReactNode
		onSelectedUser: (user: UserSearchResult) => void
	}
) {

	const [searchInput, setSearchInput] = useState('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

	// the function used to search users
	function handleSearch(searchInput: string) {
		setSearchInput(searchInput);

		// if empty search input, clear the results
		if ( searchInput == "" ) {
			setSearchResults([])
			return
		}

		setIsLoading(true);
		fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + `/search/user?query=${searchInput}`)
			.then(response => {
				if (response.status === 404) {
					throw new Error("No entry found");
				}
				if (!response.ok) { throw new Error(response.statusText); }
				return response.json();
			})
			.then(data => {
				setSearchResults(data);

			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
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


	return <>
		<Input label="Search user" value={searchInput} onChange={e => handleSearch(e.target.value)}
			   icon={<i className="bi bi-search" />} />
		{searchResultsContent}
	</>;
}
