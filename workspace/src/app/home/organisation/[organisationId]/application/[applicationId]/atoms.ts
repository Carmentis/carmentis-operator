import { atom } from 'jotai';
import { Application } from '@/entities/application.entity';

// Application Atom
export const applicationAtom = atom<Application | undefined>();
export const referenceApplicationAtom = atom<Application | undefined>();
export const applicationIsModifiedAtom = atom<boolean>((get) => {
	const application = get(applicationAtom);
	const referenceApplication = get(referenceApplicationAtom);
	if (!application || !referenceApplication) return false;
	return JSON.stringify(application) !== JSON.stringify(referenceApplication)
});



