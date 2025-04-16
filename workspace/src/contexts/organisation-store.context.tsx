import { organisationAtom } from '@/app/home/organisation/atom';
import { useAtomValue } from 'jotai';

export function useOrganisationContext() {
	const organisation = useAtomValue(organisationAtom);
	if (!organisation || !organisation.organisation) throw new Error("Organisation is undefined!")
	return organisation;
}

export function useOrganisation() {
	const organisation = useAtomValue(organisationAtom);
	if (!organisation || !organisation.organisation) throw new Error("Organisation is undefined!")
	return organisation.organisation;
}