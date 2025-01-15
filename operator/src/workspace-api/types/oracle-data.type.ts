import { EnumerationDataType, FieldDataType, MaskDataType, MessageDataType, StructureDataType } from './data.type';

/**
 * Represents the data structure used by the Oracle service containing request and answer data types.
 *
 * @typedef {Object} OracleServiceDataType
 * @property {FieldDataType[]} request - An array of field data types representing the request.
 * @property {FieldDataType[]} answer - An array of field data types representing the answer.
 */
export type OracleServiceDataType = {
	request: FieldDataType[],
	answer: FieldDataType[],
}

/**
 * Represents the data type definition for an Oracle system.
 *
 * This type is used to describe the structure of Oracle-related data,
 * which may include services, structures, enumerations, messages, and masks.
 *
 * Each property of this type is optional and describes a specific aspect of
 * Oracle data. It allows for typing and validation of multiple Oracle data elements.
 *
 * Properties:
 * - `services`: A collection of OracleServiceDataType objects representing service-related data.
 * - `structures`: A collection of StructureDataType objects defining structural elements.
 * - `enumerations`: A collection of EnumerationDataType objects representing enumerated values.
 * - `messages`: A collection of MessageDataType objects defining message-related structures.
 * - `masks`: A collection of MaskDataType objects representing mask-related definitions.
 */
export type OracleDataType = {
	services?: OracleServiceDataType[];
	structures?: StructureDataType[];
	enumerations?: EnumerationDataType[];
	messages?: MessageDataType[];
	masks?: MaskDataType[];
};