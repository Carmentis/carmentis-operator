import User, { AccessRight, UserSummary, UserSummaryList } from '@/entities/user.entity';
import useSWR, { SWRResponse } from 'swr';
import { Organisation, OrganisationSummary, OrganisationSummaryList } from '@/entities/organisation.entity';
import { Application, ApplicationSummary } from '@/entities/application.entity';
import { AccountTransactionHistoryEntry } from '@/entities/transaction-history-entry.entity';



const API = process.env.NEXT_PUBLIC_WORKSPACE_API;
console.log("Api:", API)

/**
 * Represents an entity with a unique identifier.
 * This type is typically used to define objects that are distinguished by their `id` field.
 */
export type IdentifiedEntity = {
	id: number;
}


/**
 * Represents the initialization status of an operator.
 *
 * The `OperatorInitialisationStatus` type is used to indicate whether
 * the operator has been successfully initialized. It includes a single
 * property, `initialised`, which is a boolean set to `true` when
 * initialization is complete.
 */
export type OperatorInitialisationStatus = {
	initialised: true
}

/**
 * Represents the response from a global search operation.
 *
 * This type is used to encapsulate the search results categorized into
 * various entity types such as users, oracles, applications, and organisations.
 *
 * @typedef {Object} GlobalSearchResponse
 * @property {UserSummary[]} users - The list of users returned by the search.
 * @property {ApplicationSummary[]} applications - The list of applications returned by the search.
 * @property {OrganisationSummary[]} organisations - The list of organisations returned by the search.
 */
export type GlobalSearchResponse = {
	users: UserSummary[];
	applications: ApplicationSummary[];
	organisations: OrganisationSummary[];
}


/**
 * Represents statistics related to an organisation.
 *
 * This interface is used to encapsulate various statistics and metrics
 * associated with an organisation, such as the number of applications,
 * oracles, users, as well as the organisation's balance.
 *
 * Properties:
 * - `applicationsNumber`: The total number of applications associated with the organisation.
 * - `oraclesNumber`: The total count of oracles in the organisation.
 * - `usersNumber`: The number of users within the organisation.
 * - `balance`: The organisation's financial balance.
 */
export interface OrganisationStats {
	applicationsNumber: number
	oraclesNumber: number
	usersNumber: number
	balance: number
}


/**
 * Represents a log entry for an organization operation.
 *
 * This interface is used to log operations performed on an organization,
 * capturing details about the operation, the type of entity affected,
 * the time the operation occurred, and any related organization data.
 *
 * Properties:
 * - operation: The type of operation performed (e.g., create, update, delete).
 * - entityType: The type of entity involved in the operation (e.g., organization).
 * - timestamp: The date and time at which the operation occurred, formatted as a string.
 * - relatedOrganisationId: The ID of the related organization linked to this log entry.
 * - data: An object holding additional information about the organization, such as its name.
 */
export interface OrganisationLog {
	operation: string,
	entityType: string,
	timestamp: string,
	relatedOrganisationId: number,
	data: {name: string}
}

/**
 * Represents the response containing the details of an authenticated user.
 *
 * This type is used to encapsulate user-related information that is returned after successful authentication.
 *
 * Fields:
 * - `publicKey`: The public key associated with the authenticated user.
 * - `firstname`: The first name of the authenticated user.
 * - `lastname`: The last name of the authenticated user.
 * - `isAdmin`: A boolean value indicating whether the authenticated user has administrative privileges.
 */
export type AuthenticatedUserDetailsResponse = {
	publicKey: string,
	firstname: string,
	lastname: string,
	isAdmin: boolean,
}


/**
 * Represents a successful response for a challenge.
 *
 * This type is used to encapsulate the response details provided
 * when a challenge is successfully completed, including a unique
 * token issued upon success.
 *
 * @typedef {Object} ChallengeSuccessResponse
 * @property {string} token - A unique token issued to indicate
 * the successful completion of the challenge.
 */
export type ChallengeSuccessResponse = {
	token: string,
}


export interface APICallbacks<T> {
	onStart?: undefined | (() => void),
	onSuccessData?: undefined | ((data: T) => void),
	onSuccess?: undefined | (() => void),
	onError?: undefined | ((error: string, response: Response) => void),
	onEnd?: undefined | (() => void),
}




export const TOKEN_STORAGE_ITEM = "carmentis-token";
export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_ITEM);

export async function CallApi<T>(
	url: string,
	cb: APICallbacks<T> | undefined,
	params: RequestInit | undefined,
) {
	const token = getAuthToken();
	if ( cb && cb.onStart ) cb.onStart();
	const targetUrl = API + url;
	console.log(`Contacting API at ${targetUrl}`)
	fetch(targetUrl, {
		...params,
		headers: {
			...params?.headers,
            Authorization: `Bearer ${token}`,
        },
	})
		.then(async (response) =>  {
			if ( response.ok ) {
				if ( cb && cb.onSuccess ) { cb.onSuccess() }
				if ( cb && cb.onSuccessData ) {
					const data = await response.json();
					cb.onSuccessData( data );
				}
			} else {

				if ( cb && cb.onError ) {
					try {
						const data = await response.json();
						cb.onError(data.message || response.statusText, response)
					} catch {
						cb.onError(response.statusText, response)
					}
				}
			}
		})
		.finally(() => {
			if (cb && cb.onEnd) {
				cb.onEnd()
			}
		})
}


export class WorkspaceApiError extends Error {
	constructor(
		readonly message: string,
		readonly statusCode: number
	) {
		super(`Workspace API Error[${statusCode}]: ${message}`);
	}
}

export async function fetcherJSON<T>(url: string) : Promise<T> {
	const token = getAuthToken();
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		}
	})

	if (!res.ok) {
		throw new WorkspaceApiError(res.statusText, res.status);
	}

	return res.json()
}

export interface SWRConfig {
	errorRetryCount?: number
}

/**
 * A custom hook that facilitates data fetching from a workspace API using the SWR library.
 *
 * @param {string | undefined} url - The relative API endpoint to fetch data from. If undefined, no request will be made.
 * @param config
 * @return Returns the result of the SWR hook, which includes data, error, and other utilities for managing the request lifecycle.
 */
export function useWorkspaceApi<T>( url: string | undefined, config : SWRConfig = {}): SWRResponse<T> {
	return useSWR(
		url ? API + url : url,
		fetcherJSON<T>,
		config
	);
}



export function useFetchOrganisation(organisationId: number) {
	return useWorkspaceApi<Organisation>(`/organisation/${organisationId}`);
}

export const useFetchApplicationInOrganisation = (organisationId: number, applicationId: number ) => {
	return useWorkspaceApi<Application>(
		`/organisation/${organisationId}/application/${applicationId}`,
	);
}

export const useFetchUsersInOrganisation = (organisationId: number) => {
	return useWorkspaceApi<UserSummaryList>(
		`/organisation/${organisationId}/user`
	);
}


export const useFetchOrganisationsOfUser= (userPublicKey: string | undefined) => {
	return useWorkspaceApi<OrganisationSummaryList>(
		userPublicKey ? `/user/organisation` : undefined
	);
}



export const useFetchAuthenticatedUser = () => {
	return useWorkspaceApi<UserSummary>(
		`/user/current`
	);
}



export function useFetchOrganisationApplications( organisationId: number )  {
	return useWorkspaceApi<ApplicationSummary[]>(`/organisation/${organisationId}/application`);
}


export function useFetchOrganisationStats( organisationId: number )  {
	return useWorkspaceApi<OrganisationStats>(`/organisation/${organisationId}/stats`);
}



export function useApplicationDeletionApi() {
	return async (organisationId: number, applicationId: number, cb: APICallbacks<ApplicationSummary> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${applicationId}`, cb, {
			method: "DELETE",
		});
	};
}


export function useConfirmOrganisationPublicationOnChain(organisation: Organisation) {
	return useWorkspaceApi<{published: boolean}>(
		`/organisation/${organisation.id}/checkPublishedOnChain`
	);
}




export function useOrganisationCreation() {
	return async (name: string, cb: APICallbacks<IdentifiedEntity> | undefined) => {
		return CallApi(`/organisation`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});
	};
}

export function useErasePublicationInformation() {
	return async (organisationId : number, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/erasePublication`, cb, {
			method: "PUT",
		});
	};
}




export function useFetchOperatorInitialisationStatus() {
	return useWorkspaceApi<OperatorInitialisationStatus>(`/setup/status`);
}


export function useSetupApi() {
	return async (publicKey: string, firstname: string, lastname: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/setup`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				publicKey: publicKey,
				lastname: lastname,
				firstname: firstname,
			}),
		});
	};
}

export function useUserCreation() {
	return async (publicKey: string, firstname: string, lastname: string, isAdmin: boolean, cb: APICallbacks<UserSummary> | undefined) => {
		return CallApi(`/user`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ publicKey, firstname, lastname, isAdmin }),
		});
	};
}

export function useNotWhitelistedUserCreation() {
	return async (publicKey: string, firstname: string, lastname: string,  cb: APICallbacks<UserSummary> | undefined) => {
		return CallApi(`/user/createNotWhitelistedUser`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ publicKey, firstname, lastname }),
		});
	};
}





export function useApplicationUpdateApi() {
	return async (organisationId : number, application: Application, cb: APICallbacks<IdentifiedEntity> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${application.id}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(application),
		});
	};
}

export function useOrganisationUpdateApi() {
	return async (organisation: Organisation, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisation.id}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(organisation),
		});
	};
}

export function useOrganisationDeletionApi() {
	return async (organisation: Organisation, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisation.id}`, cb, {
			method: "DELETE",
		});
	};
}

export function useOrganisationPublication() {
	return async (organisation: Organisation, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisation.id}/publish`, cb, {
			method: "POST",
		});
	};
}

export function useApplicationPublicationApi() {
	return async (organisationId: number, application: Application, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${application.id}/publish`, cb, {
			method: "POST",
		});
	};
}

export function useApplicationCreation() {
	return async (organisationId: number, applicationName: string, cb: APICallbacks<Application> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ applicationName }),
		});
	};
}






export function useUserDeletion() {
	return async (userPublicKey: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/admin/user`, cb, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ publicKey: userPublicKey }),
		});
	};
}


export function useUserOrganisationInsertion() {
	return async (organisationId: number, userPublicKey: string, cb: APICallbacks<UserSummary> | undefined) => {
		return CallApi(`/organisation/${organisationId}/user`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userPublicKey }),
		});
	};
}

export function useUserOrganisationRemoval() {
	return async (organisationId: number, userPublicKey: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/user`, cb, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userPublicKey }),
		});
	};
}



export function useAdminListOfUsersApi() {
	return useWorkspaceApi<UserSummary[]>(
		`/admin/user`
	);
}



export function useObtainChallenge()  {
	return useWorkspaceApi<{challenge: string}>(`/login/challenge`);
}


export function useChallengeVerification() {
	return async (challenge: string, signature: string, publicKey: string, cb: APICallbacks<ChallengeSuccessResponse> | undefined) => {
		return CallApi(`/login/challenge/verify`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				challenge,
				signature,
				publicKey,
			})
		});
	};
}


/**
 * A function to search for users based on the provided query string.
 * This function calls the API endpoint to retrieve user summaries that match the given query.
 *
 * @return {Function} A function that takes a query string and an optional callback,
 * executes an API call to retrieve user summaries and returns the result.
 */
export function useSearchUser() {
	return async (query: string, cb: APICallbacks<UserSummaryList> | undefined) => {
		return CallApi(`/search/user?query=${query}`, cb, undefined);
	};
}


export function useUserAccessRightInOrganisation(publicKey: string, organisationId: number) {
	return useWorkspaceApi<AccessRight>(`/organisation/${organisationId}/accessRights/${publicKey}`);
}




export function useFetchTokenAccountExistence(organisationId: number) {
	return useWorkspaceApi<{hasTokenAccount: boolean}>(`/organisation/${organisationId}/hasTokenAccount`);
}

export function useFetchAccountBalance(organisationId: number) {
	return useWorkspaceApi<{balance: number}>(`/organisation/${organisationId}/balance`);
}

export function useFetchOrganisationTransactions(organisationId: number, fromHistoryHash: string | undefined, limit: number) {
	const historyHashParam = fromHistoryHash ? `fromHistoryHash=${fromHistoryHash}` : ''
	return useWorkspaceApi<AccountTransactionHistoryEntry[]>(`/organisation/${organisationId}/transactionsHistory?${historyHashParam}&limit=${limit}`);
}


export type ApiKey = {
	id: number;
	name: string;
	createdAt: Date;
	key?: string,
	partialKey?: string,
	activeUntil?: string,
	isActive: boolean,
	application?: {
		name: string,
	}
}

export type ApiKeyUsage = {
	id: number;
	ip: string;
	requestMethod: string;
	requestUrl: string;
	responseStatus: number;
	usedAt: string
}
export function useApiKeysInApplication(organisationId: number, applicationId: number) {
	return useWorkspaceApi<ApiKey[]>(
		`/application/${applicationId}/apiKeys/`
	);
}

export function useApiKeysInOrganisation(organisationId: number) {
	return useWorkspaceApi<ApiKey[]>(
		`/organisation/${organisationId}/apiKeys/`
	);
}


export function useKeyCreationApi() {
	return async (applicationId: number, name: string, activeUntil: string, cb: APICallbacks<ApiKey> | undefined) => {
		return CallApi(`/application/${applicationId}/apiKeys`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name,
				activeUntil: activeUntil
			})
		});
	};
}

export function useKeyDeletionApi() {
	return async (applicationId: number, keyId: number, cb: APICallbacks<ApiKey> | undefined) => {
		return CallApi(`/apiKeys/${keyId}`, cb, {
			method: "DELETE",
		});
	};
}


export function useKeyApi(apiKeyId: number) {
	return useWorkspaceApi<ApiKey>(
		`/apiKeys/${apiKeyId}`
	);
}


export function useKeyUsagesApi(apiKeyId: number, offset: number, limit: number, filterByUnauthorized: boolean) {
	return useWorkspaceApi<{count:number, results: ApiKeyUsage[]}>(
		`/apiKeys/${apiKeyId}/usage?offset=${offset}&limit=${limit}&filterByUnauthorized=${filterByUnauthorized}`
	);
}


export function useKeyUpdateApi() {
	return async (keyId: number, name: string, isActive: boolean, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/apiKeys/${keyId}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name,
				isActive
			})
		});
	};
}













