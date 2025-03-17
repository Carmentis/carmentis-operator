import { atom } from 'jotai';
import { Organisation } from '@/entities/organisation.entity';

export const organisationAtom = atom<Organisation>();
export const isRoutingAtom = atom<boolean>(false);