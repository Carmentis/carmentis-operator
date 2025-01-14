import React, { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import {
	Application,
	ApplicationEditor,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';

export type ApplicationStore = {
	application: Application|undefined;
	setApplication: Dispatch<SetStateAction<Application | undefined>>
}


const ApplicationStoreContext = createContext<ApplicationStore|undefined>(undefined);
export function ApplicationStoreContextProvider({children}: PropsWithChildren) {
	const [object, setObject] = useState<Application|undefined>();

	const store: ApplicationStore = {
		application: object,
		setApplication: setObject
	}

	return <ApplicationStoreContext value={store}>
		{children}
	</ApplicationStoreContext>
}

export function useApplicationStoreContext()  {
	const context = useContext(ApplicationStoreContext);
	if ( !context ) {
		throw new Error('Cannot use useApplicationStoreContext outside of ApplicationStoreContext')
	}
	return context;
}

export const useApplication = () => {
	const store = useApplicationStoreContext();
	if (!store.application) throw new Error("Undefined application")
	return store.application;
}

export const useApplicationFields = () => {
	const application = useApplication();
	return application.data.fields;
}


export const useApplicationStrutures = () => {
	const application = useApplication();
	return application.data.structures;
}


export const useApplicationEnum = () => {
	const application = useApplication();
	return application.data.enumerations;
}

export const useApplicationMask = () => {
	const application = useApplication();
	return application.data.masks;
}

export const useApplicationMessages = () => {
	const application = useApplication();
	return application.data.messages;
}


export const useUpdateApplication = () => {
	const context = useApplicationStoreContext();
	return (cb: (application: Application, editor: ApplicationEditor) => void) => {
		context.setApplication(app => {
			const editor = new ApplicationEditor(app);
			cb(app, editor)
			return {...app}
		})
	}
};
