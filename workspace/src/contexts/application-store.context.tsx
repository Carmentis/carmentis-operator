import React, { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import {
	ApplicationEditor,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {
	AppDataEnum,
	AppDataField,
	AppDataMask,
	AppDataMessage,
	AppDataStruct,
	Application,
} from '@/entities/application.entity';
/*
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

	return <ApplicationStoreContext.Provider value={store}>
		{children}
	</ApplicationStoreContext.Provider>
}


export function useApplicationStoreContext()  {
	const context = useContext(ApplicationStoreContext);
	if ( !context ) {
		throw new Error('Cannot use useApplicationStoreContext outside of ApplicationStoreContext')
	}
	return context;
}



export const useApplication = () => {

}

export function useApplicationFields(): AppDataField[] {
	const application = useApplication();
	return application.data.fields;
}


export function useApplicationStrutures() : AppDataStruct[] {
	const application = useApplication();
	return application.data.structures;
}


export function useApplicationEnum() : AppDataEnum[] {
	const application: Application = useApplication();
	return application.data.enumerations;
}

export function useApplicationMask() : AppDataMask[] {
	const application = useApplication();
	return application.data.masks;
}

export function useApplicationMessages() : AppDataMessage[] {
	const application = useApplication();
	return application.data.messages;
}


export const useUpdateApplication = () => {
	const context = useApplicationStoreContext();
	return (cb: (application: Application, editor: ApplicationEditor) => void) => {
		context.setApplication(app => {
			if (app === undefined) return undefined;
			const editor = new ApplicationEditor(app);
			cb(app, editor)
			return {...app}
		})
	}
};

 */
