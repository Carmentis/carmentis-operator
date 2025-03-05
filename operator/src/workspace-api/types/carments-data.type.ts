import { EnumerationDataType, FieldDataType, MaskDataType, MessageDataType, StructureDataType } from './data.type';

// shared by applications and oracles in the Carmentis nomenclature
export type CarmentisMaskDataType = {
	name: string;
	regex: string;
	substitution: string;
};

export type CarmentisEnumerationDataType = {
	name: string,
	values: string[]
};


export type CarmentisFieldDataType =  {
	name: string;
	type: number;
	maskId?: number;
	structType?: number;
};

export type CarmentisOracleAnswerDataType =  {
	oracle: string,
	version: number,
	serviceName: string,
};


export type CarmentisStructureDataType = {
	name: string;
	properties: CarmentisFieldDataType[];
}

// Application
export type CarmentisMessageDataType = {
	name: string,
	content: string,
}

export type CarmentisApplicationDataType = {
	fields: CarmentisFieldDataType[],
	internalStructures: CarmentisStructureDataType[],
	oracleStructures: CarmentisOracleAnswerDataType[],
	messages: CarmentisMessageDataType[];
	enumerations: CarmentisEnumerationDataType[];
	masks: CarmentisMaskDataType[];
}


// Oracle
export type CarmentisOracleServiceDataType = {
	name: string,
	request: CarmentisFieldDataType[],
	answer: CarmentisFieldDataType[],
}

export type CarmentisOracleDataType = {
	services: CarmentisOracleServiceDataType[];
	internalStructures: CarmentisStructureDataType[];
	enumerations: CarmentisEnumerationDataType[];
	masks: CarmentisMaskDataType[];
};