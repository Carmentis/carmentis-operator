export default interface User {
	publicKey: string;
	firstname: string;
	lastname: string;
	isAdmin: boolean;
}

export interface UserSearchResult {
	publicKey: string;
	firstname: string;
	lastname: string;
}