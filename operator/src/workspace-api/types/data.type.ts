import * as sdk from '@cmts-dev/carmentis-sdk/server';

export const SupportedPrimitiveType = {
	INT: 6,
	FLOAT:  sdk.constants.DATA.FLOAT,
	STRING: sdk.constants.DATA.STRING,
}

export type MaskDataType = {
	name: string;
	regex: string;
	substitution: string;
};

export type MessageDataType = {
	name: string,
	content: string,
}

export type EnumerationDataType = {
	name: string,
	values: string[]
};


export interface DataOracle {
	id: string,
	name: string,
	oracleHash: string,
	service: string,
	version: number
}

export type FieldDataType =  {
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
		oracleName: string,
	};
};

export type StructureDataType = {
	name: string;
	properties: FieldDataType[];
}