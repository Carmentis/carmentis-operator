
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



export interface AppDataField {
	id: string,
	name: string;
	required: boolean;
	array: boolean;
	kind: 'primitive' | 'enumeration' | 'structure' | 'oracleAnswer' | 'undefined'
	primitiveType?: {
		type: string;
		mask?: string
		private: boolean
		hashable: boolean
	};
	structureType?: {
		structure: string
	};
	enumerationType?: {
		enumeration: string
	};
	oracleAnswerType?: {
		oracleHash: string,
		service: string,
		version: number
	};
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
	data: {
		fields: AppDataField[];
		structures: AppDataStruct[];
		enumerations: AppDataEnum[];
		messages: AppDataMessage[];
		masks: AppDataMask[];
	}
}

export type ApplicationSummary = Pick<Application, 'id' | 'name' | 'tag' | 'logoUrl' | 'published' | 'publishedAt' | 'isDraft' | 'version'>
export type ApplicationSummaryList = ApplicationSummary[];