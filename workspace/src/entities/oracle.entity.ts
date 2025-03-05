import { AppDataEnum, AppDataField, AppDataMask } from '@/entities/application.entity';


export type OracleDataMask =  AppDataMask;
export type OracleDataEnum = AppDataEnum;
export type OracleDataStructure = {
	id: string;
	name: string;
	properties: AppDataField[];
};

export type OracleDataService = {
	id: string;
	name: string;
	request: AppDataField[],
	answer:  AppDataField[]
}

export type OracleDataType = {
	services: OracleDataService[],
	structures: OracleDataStructure[];
	enumerations: OracleDataEnum[];
	masks: OracleDataMask[]
}

export type Oracle = {
	id: number,
	name: string,
	version: number,
	lastUpdate: Date;
	published: boolean;
	publishedAt: Date;
	isDraft: boolean,
	virtualBlockchainId?: string,
	data: OracleDataType;
}


export type OracleSummary = Pick<Oracle, 'id' | 'name' | 'isDraft' | 'published' | 'version' | 'publishedAt'>;
export type OracleSummaryList = OracleSummary[];