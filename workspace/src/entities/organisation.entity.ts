import { OrganisationEntity } from '@/generated/graphql';

export type Organisation = OrganisationEntity;
export type OrganisationSummary = Pick<Organisation, 'id' | 'name' | 'logoUrl' | 'publicSignatureKey'>;
export type OrganisationSummaryList = OrganisationSummary[];