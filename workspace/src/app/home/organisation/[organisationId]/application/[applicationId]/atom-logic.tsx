import { atom } from 'jotai/index';
import { applicationAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useSetAtom } from 'jotai';
import { ApplicationTypeFragment } from '@/generated/graphql';

type Action =
	| { type: 'UPDATE_APPLICATION'; payload: { application: ApplicationTypeFragment } };





const applicationReducer = (application: ApplicationTypeFragment | undefined, action: Action): ApplicationTypeFragment | undefined => {
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
	return (application : ApplicationTypeFragment) => {
		console.log(application)
		dispatch({ type: 'UPDATE_APPLICATION', payload: { application } });
	};
}


