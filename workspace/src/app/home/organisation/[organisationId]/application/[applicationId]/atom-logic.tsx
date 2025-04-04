import { Application } from '@/entities/application.entity';
import { atom } from 'jotai/index';
import {
	applicationAtom,
	applicationIsModifiedAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useAtomValue, useSetAtom } from 'jotai';

type Action =
	| { type: 'UPDATE_APPLICATION'; payload: { application: Application } };





const applicationReducer = (application: Application | undefined, action: Action): Application | undefined => {
	if (!application) return application;


	switch (action.type) {
		case 'UPDATE_APPLICATION':
			return action.payload.application
		default:
			console.warn(`Undefined case: `)
	}
};

const applicationWithReducerAtom = atom(
	(get) => get(applicationAtom),
	(get, set, action: Action) => {
		const current = get(applicationAtom);
		set(applicationAtom, applicationReducer(current, action));
	}
);

export const useUpdateApplication = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	return (application : Application) => {
		console.log(application)
		dispatch({ type: 'UPDATE_APPLICATION', payload: { application } });
	};
}


export const useApplicationEditionStatus = () => {
	return useAtomValue(applicationIsModifiedAtom);
}

