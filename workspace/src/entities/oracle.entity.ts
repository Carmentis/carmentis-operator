import { Field,  } from '@/components/api.hook';


export type OracleStructureField = OracleServiceOutputField;
export type OracleMask =  {
	name: string,
	regex: string;
	substitution: string;
};
export type OracleEnumeration = {
	name: string;
	values: string[]
};
export type OracleStructure = {
	name: string;
	properties: OracleStructureField[];
};

export type OracleService = {
	name: string;
	request: OracleServiceInputField[],
	answer:  OracleServiceOutputField[]
}
export type OracleServiceInputField = Field;
export type OracleServiceOutputField = Field

export type Oracle = {
	id: number,
	name: string,
	version: number,
	lastUpdate: Date;
	published: boolean;
	isDraft: boolean,
	data: {
		services: OracleService[],
		structures: OracleStructure[];
		enumerations: OracleEnumeration[];
		masks: OracleMask[]

	};
}


export type OracleSummary = Pick<Oracle, 'id' | 'name'>;
export type OracleSummaryList = OracleSummary[];