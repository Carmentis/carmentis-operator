import { env } from 'next-runtime-env';
import User, { AccessRight, UserSummary, UserSummaryList } from '@/entities/user.entity';
import useSWR from 'swr';
import { Organisation, OrganisationSummary, OrganisationSummaryList } from '@/entities/organisation.entity';
import { Application, ApplicationSummary } from '@/entities/application.entity';
import { Oracle, OracleSummary } from '@/entities/oracle.entity';



const API = process.env.NEXT_PUBLIC_WORKSPACE_API;
console.log("Api:", API)

export type IdentifiedEntity = {
	id: number;
}


export type Field = {
	name: string,
	type: number,
	maskId?: number
}

export type OperatorInitialisationStatus = {
	initialised: true
}

export type GlobalSearchResponse = {
	users: UserSummary[];
	oracles: OracleSummary[];
	applications: ApplicationSummary[];
	organisations: OrganisationSummary[];
}


export interface OrganisationStats {
	applicationsNumber: number
	oraclesNumber: number
	usersNumber: number
	balance: number
}


export interface OrganisationLog {
	operation: string,
	entityType: string,
	timestamp: string,
	relatedOrganisationId: number,
	data: {name: string}
}

export type AuthenticatedUserDetailsResponse = {
	publicKey: string,
	firstname: string,
	lastname: string,
	isAdmin: boolean,
}



export interface APICallbacks<T> {
	onStart?: undefined | (() => void),
	onSuccessData?: undefined | ((data: T) => void),
	onSuccess?: undefined | (() => void),
	onError?: undefined | ((error: string) => void),
	onEnd?: undefined | (() => void),
}
export async function CallApi<T>(
	url: string,
	cb: APICallbacks<T> | undefined,
	params: RequestInit | undefined,
) {
	if ( cb && cb.onStart ) cb.onStart();
	const targetUrl = API + url;
	console.log(`Contacting API at ${targetUrl}`)
	fetch(targetUrl, params)
		.then(async (response) =>  {
			if ( response.ok ) {
				if ( cb && cb.onSuccess ) { cb.onSuccess() }
				if ( cb && cb.onSuccessData ) {
					const data = await response.json();
					cb.onSuccessData( data );
				}
			} else {
				if ( cb && cb.onError ) {
					cb.onError(response.statusText)
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
	const res = await fetch(url)

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
 * @return {object} Returns the result of the SWR hook, which includes data, error, and other utilities for managing the request lifecycle.
 */
export function useWorkspaceApi<T>( url: string | undefined, config : SWRConfig = {}) {
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
		userPublicKey ? `/user/${userPublicKey}/organisation` : undefined
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


export function useAdminListOfOrganisationsApi() {
	return useWorkspaceApi<OrganisationSummary[]>(
		`/admin/organisation`
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

export type ChallengeSuccessResponse = {
	token: string,
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











