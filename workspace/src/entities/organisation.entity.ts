export interface Organisation {
	isDraft: boolean;
	published: boolean;
	id: number;
	name: string;
	logoUrl: string;
	city: string;
	website: string;
	countryCode: string;
	createdAt: Date;
	lastUpdatedAt: Date;
}