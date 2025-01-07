import { useFetch } from '@/components/fetcher.hook';
import { string } from 'postcss-selector-parser';
import User, { UserSearchResult } from '@/entities/user.entity';
import { number } from 'style-value-types';
import {
	Application,
	AppDataField, FieldVisility,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import useSWR from 'swr';

export interface AccessRight {
	"id": number,
	"isAdmin": boolean,
	"editUsers": boolean,
	"editOracles": boolean,
	"editApplications": boolean,

}

export interface UserInOrganisationResponse  {
	firstname: string;
	lastname: string;
	publicKey: string;
	"isAdmin": false,
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
	fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + url, params)
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

export type GetOrganisationResponse = {
	id: number;
	name: string;
	logoUrl: string;
	owner: User | null;
	createdAt: Date;
	lastUpdatedAt: Date;
}

export function fetchOrganisation(organisationId: number)  {
	return useFetch<GetOrganisationResponse>(`/organisation/${organisationId}`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" }
	});
}

export type GetApplicationResponse = Application;

export function fetchApplicationInOrganisation( organisationId: number, applicationId: number ) {
	return useFetch<GetApplicationResponse>(`/organisation/${organisationId}/application/${applicationId}`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" }
	});
}


export function fetchUsersInOrganisation(organisationId: number)  {
	return useFetch<UserInOrganisationResponse[]>(`/organisation/${organisationId}/user`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" }
	});
}


export function fetcherJSON<T>(url: string) : Promise<T> {
	return fetch(url).then((res) => res.json())
}

export function useWorkspaceApi<T>( url: string) {
	return useSWR(
		process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + url,
		fetcherJSON<T>
	);
}

export const useFetchUsersInOrganisation = (organisationId: number) => {
	return useWorkspaceApi<UserInOrganisationResponse[]>(
		`/organisation/${organisationId}/user`
	);
}


export function useFetchUserDetailsInOrganisation(organisationId: number, userPublicKey: string)  {
	return useWorkspaceApi<UserInOrganisationDetailsResponse>(`/organisation/${organisationId}/user/${userPublicKey}`);
}

export function useFetchOrganisationApplications( organisationId: number )  {
	return useWorkspaceApi<{id: number, name: string}>(`/organisation/${organisationId}/application`);
}


export interface OrganisationStats {
	applicationsNumber: number
	usersNumber: number
	balance: number
}
export function useFetchOrganisationStats( organisationId: number )  {
	return useWorkspaceApi<OrganisationStats>(`/organisation/${organisationId}/stats`);
}

export interface OrganisationLog {
	operation: string,
	entityType: string,
	timestamp: string,
	relatedOrganisationId: number,
	data: any
}
export function useFetchOrganisationLogs( organisationId: number )  {
	return useWorkspaceApi<OrganisationLog[]>(`/organisation/${organisationId}/logs`);
}



export function useApplicationDeletion() {
	return async (organisationId: number, applicationId: number, cb: APICallbacks<GetApplicationResponse> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${applicationId}`, cb, {
			method: "DELETE",
		});
	};
}

export interface UserInOrganisationDetailsResponse {
	publicKey: string;
	firstname: string;
	lastname: string;
	isAdmin: boolean;
	accessRights: AccessRight[];
}





export type ListOfOrganisationsResponse = {
	id: number
	name: string,
	logoUrl: string,
}[]



/**
 * This function returns the organisation in which the user is involved.
 */
export function fetchOrganisationsOfUser() {
	return useFetch<ListOfOrganisationsResponse>(`/organisation`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" }
	});
}

export function fetchOrganisationApplications( organisationId: number )  {
	return useFetch<{id: number, name: string}>(`/organisation/${organisationId}/application`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" }
	});
}


export function useOrganisationCreation() {
	return async (name: string, cb: APICallbacks<{id: number}> | undefined) => {
		return CallApi(`/organisation`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});
	};
}

export type CreateUserResponse = UserInOrganisationDetailsResponse;
export function useUserCreation() {
	return async (publicKey: string, firstname: string, lastname: string, cb: APICallbacks<CreateUserResponse> | undefined) => {
		return CallApi(`/user`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ publicKey, firstname, lastname }),
		});
	};
}

export function useApplicationUpdateApi() {
	return async (organisationId : number, application: Application, cb: APICallbacks<{id: number}> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${application.id}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(application),
		});
	};
}

export type CreateApplicationResponse = Application;
export function useApplicationCreation() {
	return async (organisationId: number, applicationName: string, cb: APICallbacks<CreateApplicationResponse> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ applicationName }),
		});
	};
}



export function useApplicationImport() {
	return async (organisationId: number, application: string, cb: APICallbacks<CreateApplicationResponse> | undefined) => {
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
	return async (organisationId: number, userPublicKey: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/user`, cb, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userPublicKey }),
		});
	};
}

export type UserOrganisationInsertionResponse = UserSearchResult;
export function useUserOrganisationInsertion() {
	return async (organisationId: number, userPublicKey: string, cb: APICallbacks<UserOrganisationInsertionResponse> | undefined) => {
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

export function useAffectOwner() {
	return async (organisationId: number, userPublicKey: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/owner`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userPublicKey }),
		});
	};
}


export type IdentifiedEntity = {
	id: number;
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

export type GlobalSearchResponse = {
	users: { publicKey: string, firstname: string, lastname: string }[];
	oracles: { id: number, name: string }[];
	applications: { id: number, name: string }[];
	organisations: { id: number, name: string }[];
}
export function useCallGlobalSearchApi() {
	return async (organisationId : number, query: string, cb: APICallbacks<GlobalSearchResponse> | undefined) => {
		return CallApi(`/organisation/${organisationId}/search?query=${query}`, cb, {
			method: 'GET'
		});
	};
}



export type OracleAbstract = IdentifiedEntity & {
	name: string;
}
export type OracleAbstractInOrganisationResponse = OracleAbstract[]
export function useFetchOraclesInOrganisation( organisationId: number ) {
	return useWorkspaceApi<OracleAbstractInOrganisationResponse>(`/organisation/${organisationId}/oracle`);
}


export type OracleServiceInputField = {
	id: number;
	name: string;
	type: string;
	isList: boolean;
	isRequired: boolean;
};

export type OracleServiceOutputField = {
	id: number;
	name: string;
	type: string;
	isList: boolean;
	isRequired: boolean;
	isHashable: boolean;
	visiblity: FieldVisility;
	mask: string;
}
export type OracleStructureField = OracleServiceOutputField;
export type OracleMask = {
	id: number;
	name: string;
	expression: string;
	substitution: string;
};
export type OracleEnumeration = {
	id: number;
	name: string;
	values: string[]
};
export type OracleStructure = {
	id: number;
	name: string;
	fields: OracleStructureField[];
};

export type OracleService = {
	id: number;
	name: string;
	inputs: OracleServiceInputField[],
	outputs:  OracleServiceOutputField[]
}


export type OracleInOrganisation = OracleAbstract & {
	lastUpdate: Date;
	published: boolean;
	data: {
		services: OracleService[],
		structures: OracleStructure[];
		enumerations: OracleEnumeration[];
		masks: OracleMask[]

	};
}

export function useFetchFullOracleInOrganisation( organisationId: number, oracleId: number ) {
	return useWorkspaceApi<OracleInOrganisation>(`/organisation/${organisationId}/oracle/${oracleId}`);
}

export function useOracleUpdate() {
	return async (organisationId: number, oracle: OracleInOrganisation, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/oracle/${oracle.id}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(oracle),
		});
	};
}







