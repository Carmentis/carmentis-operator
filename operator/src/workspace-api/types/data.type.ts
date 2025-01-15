/**
 * Represents a data structure used for defining a mask pattern.
 *
 * This type is commonly used to describe masking rules with a name,
 * a regular expression pattern used to match content, and a
 * substitution string used to replace the matched content.
 *
 * Properties:
 * - `name`: A string representing the name or identifier for the mask.
 * - `regex`: A string containing the regular expression pattern used for matching.
 * - `substitution`: A string defining the replacement for the matched content.
 */
export type MaskDataType = {
	name: string;
	regex: string;
	substitution: string;
};

/**
 * Represents the structure of a message data object.
 *
 * This type is typically used to define the shape of objects that hold
 * message-related information, including the sender's name and the content
 * of the message.
 *
 * - `name`: A string representing the name of the sender.
 * - `content`: A string representing the content of the message.
 */
export type MessageDataType = {
	name: string,
	content: string,
}

/**
 * Represents an enumeration data type with a name and a list of possible values.
 *
 * @typedef {Object} EnumerationDataType
 * @property {string} name - The name of the enumeration.
 * @property {string[]} values - An array of possible values for the enumeration.
 */
export type EnumerationDataType = {
	name: string,
	values: string[]
};

/**
 * Represents the structure of a field data type.
 *
 * This type defines the properties of a field, including its name, type,
 * and an optional mask identifier.
 *
 * @typedef {Object} FieldDataType
 * @property {string} name - The name of the field.
 * @property {number} type - The numerical type associated with the field.
 * @property {string} [maskId] - An optional identifier for the mask associated with the field.
 */
export type FieldDataType =  {
	name: string;
	type: number;
	maskId?: string;
};

/**
 * Represents a data structure type with a name and a collection of fields.
 *
 * This type is used to define structured data by providing a name and an array
 * of properties, where each property represents a specific field definition.
 *
 * @typedef {Object} StructureDataType
 * @property {string} name The name of the structure.
 * @property {FieldDataType[]} properties An array of field definitions that describe the structure's properties.
 */
export type StructureDataType = {
	name: string;
	properties: FieldDataType[];
}