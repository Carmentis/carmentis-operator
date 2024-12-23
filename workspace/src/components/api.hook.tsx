import { useFetch } from '@/components/fetcher.hook';
import { string } from 'postcss-selector-parser';
import User from '@/entities/user.entity';
import { number } from 'style-value-types';
import {
	Application,
	AppDataField,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';

export interface AccessRight {
	"id": number,
	"isAdmin": boolean,
	"addUser": boolean,
	"removeUser": boolean,

	"canPublish": boolean,
	"addApplication": boolean,
	"deleteApplication": boolean,

}

export interface UserInOrganisationResponse  {
	firstname: string;
	lastname: string;
	publicKey: string;
	"isAdmin": false,
	"accessRights": AccessRight[]
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
	return useFetch<UserInOrganisationResponse[]>(`/admin/organisation/${organisationId}/user`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" }
	});
}




export interface UserInOrganisationDetailsResponse {
	publicKey: string;
	firstname: string;
	lastname: string;
	isAdmin: boolean;
	accessRights: AccessRight[];
}



export function fetchUserInOrganisationDetails(organisationId: number, userPublicKey: string)  {
	return useFetch<UserInOrganisationDetailsResponse>(`/organisation/${organisationId}/user/${userPublicKey}`,{
		headers: { "Accept": "application/json", "Content-Type": "application/json" },
	});
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

export function useApplicationUpdateApi() {
	return async (organisationId : number, application: Application, cb: APICallbacks<{id: number}> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application/${application.id}`, cb, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(application),
		});
	};
}

export function useApplicationCreation() {
	return async (organisationId: number, applicationName: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/application`, cb, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ applicationName }),
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

export function useUserOrganisationInsertion() {
	return async (organisationId: number, userPublicKey: string, cb: APICallbacks<void> | undefined) => {
		return CallApi(`/organisation/${organisationId}/user`, cb, {
			method: "POST",
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

