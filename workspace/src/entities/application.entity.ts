
export interface AppDataStruct {
	name: string;
	properties: AppDataField[];
}


export interface AppDataEnum {
	name: string,
	values: string[]
}

export interface AppDataMessage {
	name: string,
	content: string,
}

export interface AppDataMask {
	name: string;
	regex: string;
	substitution: string;
}



export interface AppDataField {
	name: string;
	type: number;
	maskId?: number;
}

export type Application = {
	virtualBlockchainId: string | undefined;
	id: number;
	name: string;
	description: string;
	version: number;
	logoUrl: string;
	domain: string;
	createdAt: Date;
	lastUpdatedAt: Date;
	published: boolean;
	isDraft: boolean;
	publishedAt: Date;
	data: {
		fields: AppDataField[];
		structures: AppDataStruct[];
		enumerations: AppDataEnum[];
		messages: AppDataMessage[];
		masks: AppDataMask[];
	}
}

export type ApplicationSummary = Pick<Application, 'id' | 'name' | 'logoUrl' | 'published' | 'publishedAt' | 'isDraft' | 'version'>
export type ApplicationSummaryList = ApplicationSummary[];