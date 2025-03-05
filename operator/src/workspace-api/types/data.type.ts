export type MaskDataType = {
	id: string,
	name: string;
	regex: string;
	substitution: string;
};

export type MessageDataType = {
	id: string,
	name: string,
	content: string,
}

export type EnumerationDataType = {
	id: string,
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



export type FieldType =
	| { kind: "primitive", type: { id: string; mask?: string; private: boolean; hashable: boolean }  }
	| { kind: 'enumeration', type: { id: string } }
	| { kind: 'structure', type: { id: string } }
	| { kind: 'oracleAnswer', type: { id: string } }
	| { kind: 'undefined', type?: undefined }
	;

export type FieldDataType =  {
	id: string,
	name: string;
	required: boolean;
	array: boolean;
} & FieldType;

export type StructureDataType = {
	id: string,
	name: string;
	properties: FieldDataType[];
}