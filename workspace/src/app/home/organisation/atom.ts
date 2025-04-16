import { atom } from 'jotai';
import { GetOrganisationQuery } from '@/generated/graphql';
export const organisationAtom = atom<GetOrganisationQuery>();
export const isRoutingAtom = atom<boolean>(false);