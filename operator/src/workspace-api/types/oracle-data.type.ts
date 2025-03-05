import { EnumerationDataType, FieldDataType, MaskDataType, MessageDataType, StructureDataType } from './data.type';


export type OracleServiceDataType = {
	id: string;
	name: string,
	request: FieldDataType[],
	answer: FieldDataType[],
}


export type OracleDataType = {
	services?: OracleServiceDataType[];
	structures?: StructureDataType[];
	enumerations?: EnumerationDataType[];
	messages?: MessageDataType[];
	masks?: MaskDataType[];
};