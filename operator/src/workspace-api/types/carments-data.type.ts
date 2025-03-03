
export type CarmentisMaskDataType = {
	name: string;
	regex: string;
	substitution: string;
};


export type CarmentisMessageDataType = {
	name: string,
	content: string,
}


export type CarmentisEnumerationDataType = {
	name: string,
	values: string[]
};


export type CarmentisFieldDataType =  {
	name: string;
	type: number;
	maskId?: string;
};


export type CarmentisStructureDataType = {
	name: string;
	properties: CarmentisFieldDataType[];
}