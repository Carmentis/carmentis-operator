import {
	OracleEnumeration,
	OracleInOrganisation,
	OracleMask,
	OracleService,
	OracleServiceInputField,
	OracleServiceOutputField,
	OracleStructure,
	OracleStructureField,
} from '@/components/api.hook';
import { FieldVisility } from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';

export class OracleEditor {

	constructor(private oracle: OracleInOrganisation) {
		const data = oracle.data;

		// check if the data contains all (possibly empty) intended fields
		if ( !data.services ) {
			data.services = [];
		}

		if ( !data.structures ) {
			data.structures = [];
		}

		if  ( !data.enumerations ) {
			data.enumerations = [];
		}

		if ( !data.masks ) {
			data.masks = [];
		}
	}


	/**
	 * Creates a new OracleService with a unique identifier and adds it to the list of services.
	 * The identifier is computed as the highest existing identifier plus one.
	 *
	 * @param name - The name of the new service.
	 * @returns The newly created OracleService.
	 */
	createService(name: string): OracleService | null {
		if ( this.oracle.data.services.some(s => s.name === name) )
			return null;

		// Find the highest existing ID and compute the new ID
		const maxId = this.oracle.data.services.reduce((max, service) => Math.max(max, service.id), 0);
		const newService: OracleService = {
			id: maxId + 1,
			name,
			inputs: [],
			outputs: []
		};

		// Add the new service to the list
		this.oracle.data.services.push(newService);

		return newService;
	}

	/**
	 * Deletes an OracleService from the list of services based on its identifier.
	 * If the service is not found, no action is taken.
	 *
	 * @param id - The identifier of the service to delete.
	 * @returns `true` if a service was deleted, `false` if no service was found with the given ID.
	 */
	deleteServiceById(id: number): boolean {
		const initialLength = this.oracle.data.services.length;

		// Filter out the service with the given ID
		this.oracle.data.services = this.oracle.data.services.filter(service => service.id !== id);

		// Return true if an element was removed, otherwise false
		return this.oracle.data.services.length < initialLength;
	}

	/**
	 * Updates an existing OracleService in the list.
	 * If the service with the given ID is found, it is replaced with the updated version.
	 *
	 * @param service - The updated OracleService object.
	 * @returns `true` if the service was updated, `false` if no matching service was found.
	 */
	updateService(service: OracleService): boolean {
		// Find the index of the service with the same ID
		const index = this.oracle.data.services.findIndex(s => s.id === service.id);

		if (index !== -1) {
			// Replace the old service with the updated one
			this.oracle.data.services[index] = service;
			return true;
		}

		return false; // Service not found
	}

	// ==================== Structures ====================

	/**
	 * Creates a new OracleStructure with a unique identifier and adds it to the list.
	 * Skips creation if a structure with the same name already exists.
	 *
	 * @param name - The name of the new structure.
	 * @returns The newly created OracleStructure, or `null` if a structure with the same name exists.
	 */
	createStructure(name: string): OracleStructure | null {
		if (this.oracle.data.structures.some(structure => structure.name === name)) {
			return null; // Skip creation if name already exists
		}

		const maxId = this.oracle.data.structures.reduce((max, structure) => Math.max(max, structure.id), 0);
		const newStructure: OracleStructure = {
			id: maxId + 1,
			name,
			fields: []
		};

		this.oracle.data.structures.push(newStructure);
		return newStructure;
	}

	/**
	 * Updates an existing OracleStructure in the list.
	 *
	 * @param structure - The updated OracleStructure object.
	 * @returns `true` if the structure was updated, `false` if no matching structure was found.
	 */
	updateStructure(structure: OracleStructure): boolean {
		const index = this.oracle.data.structures.findIndex(s => s.id === structure.id);

		if (index !== -1) {
			this.oracle.data.structures[index] = structure;
			return true;
		}

		return false;
	}

	/**
	 * Deletes an OracleStructure from the list based on its identifier.
	 *
	 * @param id - The identifier of the structure to delete.
	 * @returns `true` if a structure was deleted, `false` if no structure was found with the given ID.
	 */
	deleteStructureById(id: number): boolean {
		const initialLength = this.oracle.data.structures.length;
		this.oracle.data.structures = this.oracle.data.structures.filter(structure => structure.id !== id);
		return this.oracle.data.structures.length < initialLength;
	}

	// ==================== Enumerations ====================

	/**
	 * Creates a new OracleEnumeration with a unique identifier and adds it to the list.
	 * Skips creation if an enumeration with the same name already exists.
	 *
	 * @param name - The name of the new enumeration.
	 * @returns The newly created OracleEnumeration, or `null` if an enumeration with the same name exists.
	 */
	createEnumeration(name: string): OracleEnumeration | null {
		if (this.oracle.data.enumerations.some(enumeration => enumeration.name === name)) {
			return null; // Skip creation if name already exists
		}

		const maxId = this.oracle.data.enumerations.reduce((max, enumeration) => Math.max(max, enumeration.id), 0);
		const newEnumeration: OracleEnumeration = {
			id: maxId + 1,
			name,
			values: []
		};

		this.oracle.data.enumerations.push(newEnumeration);
		return newEnumeration;
	}

	/**
	 * Updates an existing OracleEnumeration in the list.
	 *
	 * @param enumeration - The updated OracleEnumeration object.
	 * @returns `true` if the enumeration was updated, `false` if no matching enumeration was found.
	 */
	updateEnumeration(enumeration: OracleEnumeration): boolean {
		const index = this.oracle.data.enumerations.findIndex(e => e.id === enumeration.id);

		if (index !== -1) {
			this.oracle.data.enumerations[index] = enumeration;
			return true;
		}

		return false;
	}

	/**
	 * Deletes an OracleEnumeration from the list based on its identifier.
	 *
	 * @param id - The identifier of the enumeration to delete.
	 * @returns `true` if an enumeration was deleted, `false` if no enumeration was found with the given ID.
	 */
	deleteEnumerationById(id: number): boolean {
		const initialLength = this.oracle.data.enumerations.length;
		this.oracle.data.enumerations = this.oracle.data.enumerations.filter(enumeration => enumeration.id !== id);
		return this.oracle.data.enumerations.length < initialLength;
	}

	// ==================== Masks ====================

	/**
	 * Creates a new OracleMask with a unique identifier and adds it to the list.
	 * Skips creation if a mask with the same name already exists.
	 *
	 * @param name - The name of the new mask.
	 * @returns The newly created OracleMask, or `null` if a mask with the same name exists.
	 */
	createMask(name: string): OracleMask | null {
		if (this.oracle.data.masks.some(mask => mask.name === name)) {
			return null; // Skip creation if name already exists
		}

		const maxId = this.oracle.data.masks.reduce((max, mask) => Math.max(max, mask.id), 0);
		const newMask: OracleMask = {
			id: maxId + 1,
			name,
			expression: "",
			substitution: ""
		};

		this.oracle.data.masks.push(newMask);
		return newMask;
	}


	/**
	 * Updates an existing OracleMask in the list.
	 *
	 * @param mask - The updated OracleMask object.
	 * @returns `true` if the mask was updated, `false` if no matching mask was found.
	 */
	updateMask(mask: OracleMask): boolean {
		const index = this.oracle.data.masks.findIndex(m => m.id === mask.id);

		if (index !== -1) {
			this.oracle.data.masks[index] = mask;
			return true;
		}

		return false;
	}

	/**
	 * Deletes an OracleMask from the list based on its identifier.
	 *
	 * @param id - The identifier of the mask to delete.
	 * @returns `true` if a mask was deleted, `false` if no mask was found with the given ID.
	 */
	deleteMaskById(id: number): boolean {
		const initialLength = this.oracle.data.masks.length;
		this.oracle.data.masks = this.oracle.data.masks.filter(mask => mask.id !== id);
		return this.oracle.data.masks.length < initialLength;
	}

	// ==================== Service Inputs ====================

	/**
	 * Creates a new OracleServiceInputField and adds it to a service.
	 *
	 * @param serviceId - The ID of the service to which the input will be added.
	 * @param name - The name of the new input field.
	 * @returns The newly created OracleServiceInputField, or `null` if the service is not found.
	 */
	createServiceInput(serviceId: number, name: string): OracleServiceInputField | null {
		const service = this.oracle.data.services.find(s => s.id === serviceId);
		if (!service) return null;

		if (service.inputs.some(value => value.name === name)) return null;

		const maxId = service.inputs.reduce((max, input) => Math.max(max, input.id), 0);
		const newInput: OracleServiceInputField = {
			id: maxId + 1,
			name,
			type: 'string',
			isList: false,
			isRequired: false
		};

		service.inputs.push(newInput);
		return newInput;
	}

	/**
	 * Updates an existing OracleServiceInputField in a service.
	 *
	 * @param serviceId - The ID of the service containing the input field.
	 * @param input - The updated OracleServiceInputField object.
	 * @returns `true` if the input was updated, `false` if no matching service or input was found.
	 */
	updateServiceInput(serviceId: number, input: OracleServiceInputField): boolean {
		const service = this.oracle.data.services.find(s => s.id === serviceId);
		if (!service) return false;

		const index = service.inputs.findIndex(i => i.id === input.id);
		if (index !== -1) {
			service.inputs[index] = input;
			return true;
		}

		return false;
	}

	/**
	 * Deletes an OracleServiceInputField from a service.
	 *
	 * @param serviceId - The ID of the service containing the input field.
	 * @param inputId - The ID of the input field to delete.
	 * @returns `true` if the input was deleted, `false` if no matching service or input was found.
	 */
	deleteServiceInputById(serviceId: number, inputId: number): boolean {
		const service = this.oracle.data.services.find(s => s.id === serviceId);
		if (!service) return false;

		const initialLength = service.inputs.length;
		service.inputs = service.inputs.filter(input => input.id !== inputId);
		return service.inputs.length < initialLength;
	}

	// ==================== Service Outputs ====================

	/**
	 * Creates a new OracleServiceOutputField and adds it to a service.
	 *
	 * @param serviceId - The ID of the service to which the output will be added.
	 * @param name - The name of the new output field.
	 * @returns The newly created OracleServiceOutputField, or `null` if the service is not found.
	 */
	createServiceOutput(serviceId: number, name: string): OracleServiceOutputField | null {
		const service = this.oracle.data.services.find(s => s.id === serviceId);
		if (!service) return null;
		if (service.outputs.some(o => o.name === name)) return null;

		const maxId = service.outputs.reduce((max, output) => Math.max(max, output.id), 0);
		const newOutput: OracleServiceOutputField = {
			id: maxId + 1,
			name,
			type: 'string',
			isList: false,
			isRequired: false,
			isHashable: false,
			visiblity: FieldVisility.public,
			mask: ''
		};

		service.outputs.push(newOutput);
		return newOutput;
	}

	/**
	 * Updates an existing OracleServiceOutputField in a service.
	 *
	 * @param serviceId - The ID of the service containing the output field.
	 * @param output - The updated OracleServiceOutputField object.
	 * @returns `true` if the output was updated, `false` if no matching service or output was found.
	 */
	updateServiceOutput(serviceId: number, output: OracleServiceOutputField): boolean {
		const service = this.oracle.data.services.find(s => s.id === serviceId);
		if (!service) return false;

		const index = service.outputs.findIndex(o => o.id === output.id);
		if (index !== -1) {
			service.outputs[index] = output;
			return true;
		}

		return false;
	}

	updateStructureField(structureId: number, field: OracleStructureField) {
		const structure = this.oracle.data.structures.find(s => s.id === structureId);
		if (!structure) return false;

		const index = structure.fields.findIndex(f => f.id === field.id);
		if (index !== -1) {
			structure.fields[index] = field;
			return true;
		}

		return true;
	}

	/**
	 * Deletes an OracleServiceOutputField from a service.
	 *
	 * @param serviceId - The ID of the service containing the output field.
	 * @param outputId - The ID of the output field to delete.
	 * @returns `true` if the output was deleted, `false` if no matching service or output was found.
	 */
	deleteServiceOutputById(serviceId: number, outputId: number): boolean {
		const service = this.oracle.data.services.find(s => s.id === serviceId);
		if (!service) return false;

		const initialLength = service.outputs.length;
		service.outputs = service.outputs.filter(output => output.id !== outputId);
		return service.outputs.length < initialLength;
	}

// ==================== Structure Fields ====================

	/**
	 * Adds a new field to a structure.
	 *
	 * @param structureId - The ID of the structure.
	 * @param name - The name of the new field.
	 * @returns The newly created OracleStructureField, or `null` if the structure is not found.
	 */
	createStructureField(structureId: number, name: string): OracleStructureField | null {
		const structure = this.oracle.data.structures.find(s => s.id === structureId);
		if (!structure) return null;
		if (structure.fields.some(f => f.name === name)) return null;

		const maxId = structure.fields.reduce((max, field) => Math.max(max, field.id), 0);
		const newField: OracleStructureField = {
			isHashable: false,
			mask: undefined,
			visiblity: FieldVisility.public,
			id: maxId + 1,
			name,
			type: 'string',
			isList: false,
			isRequired: false
		};

		structure.fields.push(newField);
		return newField;
	}

	deleteStructureFieldById(structureId: number, fieldId: number) {
		const structure = this.oracle.data.structures.find(s => s.id === structureId);
		if (!structure) return false;

		const initialLength = structure.fields.length;
		structure.fields = structure.fields.filter(field => field.id !== fieldId);
		return structure.fields.length < initialLength;
	}

	// ==================== Enumeration Values ====================

	/**
	 * Adds a new value to an enumeration.
	 *
	 * @param enumerationId - The ID of the enumeration.
	 * @param value - The value to add.
	 * @returns `true` if the value was added, `false` if the enumeration was not found or the value already exists.
	 */
	addEnumerationValue(enumerationId: number, value: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.id === enumerationId);
		if (!enumeration || enumeration.values.includes(value)) return false;

		enumeration.values.push(value);
		return true;
	}

	/**
	 * Updates a value in an enumeration.
	 *
	 * @param enumerationId - The ID of the enumeration.
	 * @param oldValue - The existing value to update.
	 * @param newValue - The new value to replace the old one.
	 * @returns `true` if the value was updated, `false` if the enumeration or value was not found.
	 */
	updateEnumerationValue(enumerationId: number, oldValue: string, newValue: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.id === enumerationId);
		if (!enumeration) return false;

		const index = enumeration.values.indexOf(oldValue);
		if (index !== -1) {
			enumeration.values[index] = newValue;
			return true;
		}

		return false;
	}

	/**
	 * Removes a value from an enumeration.
	 *
	 * @param enumerationId - The ID of the enumeration.
	 * @param value - The value to remove.
	 * @returns `true` if the value was removed, `false` if the enumeration or value was not found.
	 */
	removeEnumerationValue(enumerationId: number, value: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.id === enumerationId);
		if (!enumeration) return false;

		const initialLength = enumeration.values.length;
		enumeration.values = enumeration.values.filter(v => v !== value);
		return enumeration.values.length < initialLength;
	}

	static createFromOracle(oracle: OracleInOrganisation | undefined) {
		if ( oracle === undefined ) throw new Error('Cannot instantiate an editor from an undefined oracle.')
		return new OracleEditor(oracle);
	}


}