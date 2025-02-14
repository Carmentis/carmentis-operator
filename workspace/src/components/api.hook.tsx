import User, { AccessRight, UserSummary, UserSummaryList } from '@/entities/user.entity';
import useSWR, { SWRResponse } from 'swr';
import { Organisation, OrganisationSummary, OrganisationSummaryList } from '@/entities/organisation.entity';
import { Application, ApplicationSummary } from '@/entities/application.entity';
import { Oracle, OracleSummary } from '@/entities/oracle.entity';
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
 * Represents a field with a name, type, and an optional mask ID.
 *
 * @typedef {Object} Field
 * @property {string} name - The name of the field.
 * @property {number} type - The type of the field represented as a number.
 * @property {number} [maskId] - An optional identifier for masking operations.
 */
export type Field = {
	name: string,
	type: number,
	maskId?: number
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
 * @property {OracleSummary[]} oracles - The list of oracles returned by the search.
 * @property {ApplicationSummary[]} applications - The list of applications returned by the search.
 * @property {OrganisationSummary[]} organisations - The list of organisations returned by the search.
 */
export type GlobalSearchResponse = {
	users: UserSummary[];
	oracles: OracleSummary[];
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
	onError?: undefined | ((error: string) => void),
	onEnd?: undefined | (() => void),
}




export const TOKEN_STORAGE_ITEM = "carmentis-token";
const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_ITEM);

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
						cb.onError(data.message || response.statusText)
					} catch {
						cb.onError(response.statusText)
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



export function useFetchUserInOrganisation(organisationId: number, userPublicKey: string)  {
	return useWorkspaceApi<User>(`/organisation/${organisationId}/user/${userPublicKey}`);
}

export function useFetchOrganisationApplications( organisationId: number )  {
	return useWorkspaceApi<ApplicationSummary[]>(`/organisation/${organisationId}/application`);
}


export function useFetchOrganisationStats( organisationId: number )  {
	return useWorkspaceApi<OrganisationStats>(`/organisation/${organisationId}/stats`);
}


export function useFetchOrganisationLogs( organisationId: number )  {
	return useWorkspaceApi<OrganisationLog[]>(`/organisation/${organisationId}/logs`);
}





export function useApplicationDeletionApi() {
	return async (organisationId: number, applicationId: number, cb: APICallbacks<ApplicationSummary> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${applicationId}`, cb, {
			method: "DELETE",
		});
	};
}


export function useAdminListOfOrganisationsApi(query: string) {
	return useWorkspaceApi<OrganisationSummary[]>(
		`/admin/organisation?query=${query}`
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

export function useSandboxCreationApi() {
	return async (cb: APICallbacks<IdentifiedEntity> | undefined) => {
		return CallApi(`/sandbox`, cb, {
			method: "POST",
		});
	};
}


export function useFetchOperatorInitialisationStatus(cb: APICallbacks<OperatorInitialisationStatus>) {
	return CallApi(`/setup/status`, cb, {
		method: 'GET'
	});
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



export function useApplicationImport() {
	return async (organisationId: number, application: string, cb: APICallbacks<ApplicationSummary> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/import`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body:  application,
		});
	};
}

export function useUpdateAccessRight() {
	return async (organisationId : number, userPublicKey: string, accessRight: AccessRight, cb: APICallbacks<AccessRight> | undefined) => {
		return CallApi(`/organisation/${organisationId}/user/${userPublicKey}/rights`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(accessRight),
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


export function useOracleCreation() {
	return async (organisationId: number, name: string, cb: APICallbacks<IdentifiedEntity> | undefined) => {
		return CallApi(`/organisation/${organisationId}/oracle`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});
	};
}

export function useOracleDeletion() {
	return async (organisationId: number, oracleId: number, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/oracle/${oracleId}`, cb, {
			method: "DELETE",
		});
	};
}


export function useCallGlobalSearchApi() {
	return async (organisationId : number, query: string, cb: APICallbacks<GlobalSearchResponse> | undefined) => {
		return CallApi(`/organisation/${organisationId}/search?query=${query}`, cb, {
			method: 'GET'
		});
	};
}




export function useFetchOraclesSummaryInOrganisation(organisationId: number ) {
	return useWorkspaceApi<OracleSummary[]>(`/organisation/${organisationId}/oracle`);
}



export function useFetchOracleInOrganisation(organisationId: number, oracleId: number ) {
	return useWorkspaceApi<Oracle>(`/organisation/${organisationId}/oracle/${oracleId}`);
}

export function useOracleUpdate() {
	return async (organisationId: number, oracle: Oracle, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/oracle/${oracle.id}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(oracle),
		});
	};
}



export function useAdminListOfUsersApi() {
	return useWorkspaceApi<UserSummary[]>(
		`/admin/user`
	);
}



export function useOraclePublication() {
	return async (organisationId: number, oracleId: number, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/oracle/${oracleId}/publish`, cb, {
			method: "POST",
		});
	};
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


export function useAuthUserAccessRightInOrganisation(organisationId: number) {
	return useWorkspaceApi<AccessRight>(`/organisation/${organisationId}/accessRights`);
}

export function useUserAccessRightInOrganisation(publicKey: string, organisationId: number) {
	return useWorkspaceApi<AccessRight>(`/organisation/${organisationId}/accessRights/${publicKey}`);
}

export function useCountUserInOrganisation(organisationId: number) {
	return useWorkspaceApi<{count: number}>(`/organisation/${organisationId}/countUsers`);
}


export function useFetchCurrentUserIsAdministrator() {
	return useWorkspaceApi<{isAdmin: boolean}>(`/user/isAdmin`);
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














