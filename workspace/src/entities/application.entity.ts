export type Application = {
	virtualBlockchainId: string | undefined;
	id: number;
	name: string;
	tag: string | undefined;
	description: string;
	version: number;
	logoUrl: string;
	domain: string;
	createdAt: Date;
	lastUpdatedAt: Date;
	published: boolean;
	isDraft: boolean;
	publishedAt: Date;
}
