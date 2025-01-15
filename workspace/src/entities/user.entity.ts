
export type AccessRight =  {
	id: string,
	"isAdmin": boolean,
	"editUsers": boolean,
	"editOracles": boolean,
	"editApplications": boolean,
}

export default interface User {
	publicKey: string;
	firstname: string;
	lastname: string;
	isAdmin: boolean;
	accessRights: AccessRight[],
}

export type UserSummary = Omit<User, 'accessRights'>;
export type UserSummaryList = UserSummary[];

export interface UserSearchResult {
	publicKey: string;
	firstname: string;
	lastname: string;
}
