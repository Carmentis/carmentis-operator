export type Organisation = {
	publishedAt: Date;
	isDraft: boolean;
	isSandbox: boolean;
	published: boolean;
	id: number;
	name: string;
	logoUrl: string;
	city: string;
	website: string;
	countryCode: string;
	createdAt: Date;
	lastUpdatedAt: Date;
	publicSignatureKey: string;
	virtualBlockchainId: string;
	operatorEndpoint: string;
	version: number;
	balance: number;
}

export type OrganisationSummary = Pick<Organisation, 'id' | 'name' | 'logoUrl' | 'isSandbox'>;
export type OrganisationSummaryList = OrganisationSummary[];