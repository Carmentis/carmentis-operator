import { atom } from 'jotai';
import { AppDataField, AppDataMask, AppDataStruct, Application } from '@/entities/application.entity';

// Application Atom
export const applicationAtom = atom<Application | undefined>();
export const referenceApplicationAtom = atom<Application | undefined>();
export const applicationIsModifiedAtom = atom<boolean>((get) => {
	const application = get(applicationAtom);
	const referenceApplication = get(referenceApplicationAtom);
	if (!application || !referenceApplication) return false;
	return JSON.stringify(application) !== JSON.stringify(referenceApplication)
});


export const applicationFieldsAtom = atom((get) => {
	const application = get(applicationAtom);
    if (!application) return [];
    return application.data.fields ?? []
})

export const applicationStructuresAtom = atom((get) => {
	const application = get(applicationAtom);
	if (!application) return [];
	return application.data.structures ?? []
})

export const applicationMasksAtom = atom((get) => {
	const application = get(applicationAtom);
	if (!application) return [];
	return application.data.masks ?? []
})

export const applicationMessagesAtom = atom((get) => {
	const application = get(applicationAtom);
	if (!application) return [];
	return application.data.messages ?? []
})

export const applicationEnumerationsAtom = atom((get) => {
	const application = get(applicationAtom);
	if (!application) return [];
	return application.data.enumerations ?? []
})


