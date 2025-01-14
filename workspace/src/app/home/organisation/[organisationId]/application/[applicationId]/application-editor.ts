import { GetApplicationResponse } from '@/components/api.hook';
import * as sdk from '@cmts-dev/carmentis-sdk';

export interface AppDataStruct {
	name: string;
	properties: AppDataField[];
}

export enum FieldVisility {
	public = "public",
	private = 'private',
}

export enum PrimitiveType {
	string = 'string',
	integer = 'integer',
	amount = 'amount',
	file = 'file',
	binary = 'binary',
	hash = 'hash',
	date = 'date',
	decimal = 'decimal',
}


export interface AppDataEnum {
	name: string,
	values: string[]
}

export interface AppDataMessage {
	name: string,
	message: string,
}

export interface AppDataMask {
	name: string;
	regex: string;
	substitution: string;
}



export interface AppDataField {
	name: string;
	type: number;
	maskId?: number;
}

export interface Application {
	id: number;
	name: string;
	version: number;
	logoUrl: string;
	domain: string;
	createdAt: Date;
	lastUpdatedAt: Date;
	published: boolean;
	isDraft: boolean;
	publishedAt: Date;
	data: {
		fields: AppDataField[];
		structures: AppDataStruct[];
		enumerations: AppDataEnum[];
		messages: AppDataMessage[];
		masks: AppDataMask[];
	}
}

export class ApplicationBuilder {
	static BuildFromApiResponse( response: GetApplicationResponse ): Application {

		// check that all fields are defined otherwise initialized them
		const data = response.data;
		if ( !data.fields ) data.fields = [];
		if ( !data.structures ) data.structures = [];
		if ( !data.enumerations ) data.enumerations = [];
		if ( !data.masks ) data.masks = [];
		if ( !data.messages ) data.messages = [];

		// create the editor
		return response;
	}
}

export class ApplicationEditor {
	private readonly application: Application;

	public constructor(application: Application) {
		this.application = application
	}



	createField( fieldName: string ) {
		this.addField(this.createDefaultField(fieldName))
	}

	addField(field: AppDataField): void {
		if ( this.application.data.fields.find( (f) => f.name === field.name ) ) {
			return
		}
		this.application.data.fields.push(field);
	}


	addStructure(structure : AppDataStruct): void {
		const structures = this.application.data.structures;
		if ( structures.find( (s) => s.name === structure.name ) ) {
			console.warn(`Already contains a structure ${structure.name}`);
		} else {
			console.log(`Creating structure ${structure.name}`)
			structures.push(structure);
		}

	}

	get fields() {
		return this.application.data.fields;
	}

	get structures() {
		return this.application.data.structures;
	}

	removeFieldByName(fieldName: string) {
		this.application.data.fields = this.fields.filter(f => f.name !== fieldName);
	}

	/**
	 * Creates a new structure with the specified name.
	 *
	 * @param {string} structureName - The name of the structure to create.
	 * @returns {void}
	 */
	createStructure(structureName: string): void {
		this.addStructure({
			name: structureName,
			properties: []
		})
	}

	/**
	 * Creates a new field in a specified structure.
	 *
	 * @param {string} structureName - The name of the structure in which to create the field.
	 * @param {string} fieldName - The name of the field to create.
	 * @returns {void}
	 */
	createFieldInStructure(structureName: string, fieldName: string): void {
		// check if the field do not already exists
		const structure = this.application.data.structures.find((s) => s.name === structureName);
		if ( !structure ) throw new Error(`Structure ${structureName} not found`);

		const fieldExists = structure.properties.find((f) => f.name === fieldName);
		if ( fieldExists ) {
			console.warn(`Field ${fieldName} already exists in structure ${structureName}`);
		} else {
			// add the field in the structure
			const defaultField = this.createDefaultField(fieldName);
			const structure = this.getStructureByName(structureName);
			structure.properties.push(defaultField);
		}
	}


	/**
	 * Retrieves a structure by its name from the application's structures.
	 *
	 * @param {string} structureName - The name of the structure to retrieve.
	 * @returns {AppDataStruct} The structure object with the matching name.
	 * @throws {Error} If no structures are found with the specified name.
	 * @throws {Error} If multiple structures are found with the specified name.
	 */
	getStructureByName( structureName: string ) : AppDataStruct  {
		const foundStructures = this.application.data.structures
			.filter(s => s.name === structureName);
		if ( foundStructures.length === 0 ) {
			throw new Error(`No structure found for structure ${structureName}`);
		} else if ( foundStructures.length > 1 ) {
			throw new Error(`Too much structures found (${foundStructures.length}) for structure ${structureName}`);
		} else {
			return foundStructures[0];
		}
	}

	updateFieldInStructure(structureName: string, field: AppDataField) {
		const structure = this.application.data.structures.find((s) => s.name === structureName);
		if ( !structure ) throw new Error(`Structure ${structureName} not found`);
		structure.properties = structure.properties.map(
			f => f.name === field.name ? field : f
		);
	}

	updateField(field: AppDataField) {
		this.application.data.fields = this.application.data.fields.map(f => {
			return f.name === field.name ? field : f;
		})
	}


	private createDefaultField( fieldName: string ): AppDataField {
		return {
			name: fieldName,
			type: sdk.utils.data.createType({
				public: true,
				optional: true,
				type: sdk.constants.DATA.STRING
			}),
		}
	}

	removeStructureByName(structureName: string) {
		this.application.data.structures = this.application.data.structures.filter(
			s => s.name !== structureName
		)
	}

	removeFieldInStructureByName(structureName: string, fieldName: string) {
		const structure: AppDataStruct = this.application.data.structures.find(
			s => s.name === structureName
		);
		if ( !structure ) throw new Error(`Structure ${structureName} not found`);
		structure.properties = structure.properties.filter(f => f.name !== fieldName);
	}

	createEnumeration(name: string) {
		// abort if the enumeration already exist
		const enumerations = this.application.data.enumerations;
		if ( enumerations.find( (s) => s.name === name) ) {
			console.warn(`Enumeration ${name} already exist`);
		} else {
			enumerations.push({
				name: name,
				values: []
			})
		}
	}

	removeEnumerationByName(name: string) {
		const data = this.application.data;
		data.enumerations = data.enumerations.filter(
			e => e.name !== name
		)
	}

	createValueInEnum(name: string, value: string) {
		const dataEnumerations = this.application.data.enumerations;
		const enumeration = dataEnumerations.find((e) => e.name === name);
		if ( enumeration ) {
			const valueNotExistsYet = enumeration.values.find(v => v.value === value);
			if ( !valueNotExistsYet ) {
				const id = enumeration.values.length;
				enumeration.values.push({
					value: value,
					id: id
				})
			} else {
				console.warn("Value in enum already exists")
			}

		}
	}

	removeValueInEnum(name: string, value: string) {
		const dataEnumerations = this.application.data.enumerations;
		const enumeration = dataEnumerations.find((e) => e.name === name);
		if ( enumeration ) {
			enumeration.values = enumeration.values.filter(v => v.value !== value);
			enumeration.values = enumeration.values.map((value,index) => {
				value.id = index
				return value
			})
		}
	}

	createMaskByName(name: string) {
		const masks = this.application.data.masks;
		const alreadyExists = masks.find((s) => s.name === name);
		if ( !alreadyExists ) {
			masks.push({
				name: name,
				substitution: "",
				regex: "",
			})
		}
	}

	removeMaskByName(name: string) {
		this.application.data.masks = this.application.data.masks
			.filter(mask => mask.name !== name)
	}

	updateMask(name: string, mask: AppDataMask) {
		this.application.data.masks = this.application.data.masks.map(m => {
			return m.name === name ? mask : m;
		})
	}

	updateMessage(name: string, message: AppDataMessage) {
		this.application.data.messages = this.application.data.messages.map(m => {
			return m.name === name ? message : m;
		})
	}

	removeMessageByName(name: string) {
		this.application.data.messages = this.application.data.messages.filter(m => m.name !== name);
	}

	createMessageByName(name: string) {
		const messages = this.application.data.messages;
		const alreadyExists = messages.find((message) => message.name === name);
		if ( !alreadyExists ) {
			messages.push({
				name: name,
				message: ''
			})
		}
	}
}