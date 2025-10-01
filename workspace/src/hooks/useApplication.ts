import { useAtomValue } from 'jotai';
import { applicationAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';

export const useApplication = () => {
	const application = useAtomValue(applicationAtom);
	if (!application) throw new Error('Undefined application');
	return application;
};