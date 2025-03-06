
export interface AppDataStruct {
	id: string,
	name: string;
	properties: AppDataField[];
}


export interface AppDataEnum {
	id: string,
	name: string,
	values: string[]
}

export interface AppDataMessage {
	id: string,
	name: string,
	content: string,
}

export interface AppDataMask {
	id: string,
	name: string;
	regex: string;
	substitution: string;
}


export type AppDataFieldType =
	| { kind: "primitive", type: { id: string; mask?: string; private: boolean; hashable: boolean }  }
	| { kind: 'enumeration', type: { id: string } }
	| { kind: 'structure', type: { id: string } }
	| { kind: 'oracleAnswer', type: { id: string } }
	| { kind: 'undefined', type: undefined }
	;

export type AppDataField = {
	id: string,
	name: string;
	required: boolean;
	array: boolean;
} & AppDataFieldType


export type AppDataOracle = {
	id: string,
	name: string,
	oracleName: string,
	oracleHash: string,
	service: string,
	version: number
}

export type ApplicationDataType = {
	fields: AppDataField[];
	structures: AppDataStruct[];
	enumerations: AppDataEnum[];
	messages: AppDataMessage[];
	masks: AppDataMask[];
	oracles: AppDataOracle[];
}
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
	data: ApplicationDataType
}

export type ApplicationSummary = Pick<Application, 'id' | 'name' | 'tag' | 'logoUrl' | 'published' | 'publishedAt' | 'isDraft' | 'version'>
export type ApplicationSummaryList = ApplicationSummary[];