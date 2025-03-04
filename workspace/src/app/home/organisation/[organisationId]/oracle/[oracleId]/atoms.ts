import { atom } from 'jotai';
import { AppDataField, AppDataMask, AppDataStruct, Application } from '@/entities/application.entity';
import { Oracle } from '@/entities/oracle.entity';

// Application Atom
export const oracleAtom = atom<Oracle | undefined>();
export const referenceOracleAtom = atom<Oracle | undefined>();
export const oracleIsModifiedAtom = atom<boolean>((get) => {
	const oracle = get(oracleAtom);
	const referenceOracle = get(referenceOracleAtom);
	if (!oracle || !referenceOracle) return false;
	return JSON.stringify(oracle) !== JSON.stringify(referenceOracle)
});


export const oracleServicesAtom = atom((get) => {
	const oracle = get(oracleAtom);
    if (!oracle) return [];
    return oracle.data.services ?? []
});

export const oracleStructureAtom = atom((get) => {
	const oracle = get(oracleAtom);
	if (!oracle) return [];
	return oracle.data.structures ?? []
});

export const oracleMasksAtom = atom((get) => {
	const oracle = get(oracleAtom);
	if (!oracle) return [];
	return oracle.data.masks ?? []
});


export const oracleEnumerationAtom = atom((get) => {
	const oracle = get(oracleAtom);
	if (!oracle) return [];
	return oracle.data.enumerations ?? []
});
