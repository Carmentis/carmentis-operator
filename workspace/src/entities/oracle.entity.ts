import { AppDataEnum, AppDataField, AppDataMask } from '@/entities/application.entity';


export type OracleDataStructureField = OracleDataServiceOutputField;
export type OracleDataMask =  AppDataMask;
export type OracleDataEnum = AppDataEnum;
export type OracleDataStructure = {
	id: string;
	name: string;
	properties: OracleDataStructureField[];
};

export type OracleDataService = {
	id: string;
	name: string;
	request: OracleDataServiceInputField[],
	answer:  OracleDataServiceOutputField[]
}
export type OracleDataServiceInputField = AppDataField;
export type OracleDataServiceOutputField = AppDataField;

export type Oracle = {
	id: number,
	name: string,
	version: number,
	lastUpdate: Date;
	published: boolean;
	publishedAt: Date;
	isDraft: boolean,
	virtualBlockchainId?: string,
	data: {
		services: OracleDataService[],
		structures: OracleDataStructure[];
		enumerations: OracleDataEnum[];
		masks: OracleDataMask[]
	};
}


export type OracleSummary = Pick<Oracle, 'id' | 'name' | 'isDraft' | 'published' | 'version' | 'publishedAt'>;
export type OracleSummaryList = OracleSummary[];