import { useAtomValue } from 'jotai';
import { applicationIsModifiedAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';

export const useApplicationEditionStatus = () => {
	return useAtomValue(applicationIsModifiedAtom);
};