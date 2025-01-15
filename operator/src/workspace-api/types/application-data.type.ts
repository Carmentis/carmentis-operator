import { EnumerationDataType, FieldDataType, MaskDataType, MessageDataType, StructureDataType } from './data.type';


export type ApplicationDataType = {
	fields?: FieldDataType[];
	structures?: StructureDataType[];
	enumerations?: EnumerationDataType[];
	messages?: MessageDataType[];
	masks?: MaskDataType[];
}