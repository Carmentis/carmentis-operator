import * as sdk from '@cmts-dev/carmentis-sdk/client';
import {
	Oracle,
	OracleEnumeration,
	OracleMask,
	OracleService,
	OracleServiceInputField, OracleServiceOutputField,
	OracleStructure, OracleStructureField,
} from '@/entities/oracle.entity';

/**
 * The OracleEditor class provides functionality to manage and manipulate various components
 * such as services, structures, enumerations, and masks within an Oracle instance's data.
 */
export class OracleEditor {

	constructor(private oracle: Oracle) {
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
	 * Creates a new OracleService with the given name and adds it to the list of services if it does not already exist.
	 *
	 * @param {string} name - The name of the service to be created.
	 * @return {OracleService | null} The newly created OracleService if the service did not already exist, otherwise null.
	 */
	createService(name: string): OracleService | null {
		if ( this.oracle.data.services.some(s => s.name === name) )
			return null;

		const newService: OracleService = {
			name,
			request: [],
			answer: []
		};

		// Add the new service to the list
		this.oracle.data.services.push(newService);

		return newService;
	}

	/**
	 * Deletes a service by its name from the list of services.
	 *
	 * @param {string} name - The name of the service to be deleted.
	 * @return {boolean} Returns true if the service was successfully deleted, otherwise false.
	 */
	deleteServiceByName(name: string): boolean {
		const initialLength = this.oracle.data.services.length;

		// Filter out the service with the given ID
		this.oracle.data.services = this.oracle.data.services.filter(service => service.name !== name);

		// Return true if an element was removed, otherwise false
		return this.oracle.data.services.length < initialLength;
	}


	/**
	 * Updates a service in the list by its name.
	 *
	 * @param {string} name - The name of the service to be updated.
	 * @param {OracleService} service - The updated service object to replace the existing service.
	 * @return {boolean} Returns true if the service was successfully updated, false if no matching service was found.
	 */
	updateServiceByName(name: string, service: OracleService): boolean {
		// Find the index of the service with the same ID
		const index = this.oracle.data.services.findIndex(s => s.name === name);

		if (index !== -1) {
			// Replace the old service with the updated one
			this.oracle.data.services[index] = service;
			return true;
		}

		return false; // Service not found
	}

	// ==================== Structures ====================

	/**
	 * Creates a new structure with the given name and adds it to the oracle's data structures.
	 * If a structure with the same name already exists, the method returns null.
	 *
	 * @param {string} name - The name of the structure to be created.
	 * @return {OracleStructure | null} The newly created structure object if successful, or null if a structure with the same name already exists.
	 */
	createStructure(name: string): OracleStructure | null {
		if (this.oracle.data.structures.some(structure => structure.name === name)) {
			return null; // Skip creation if name already exists
		}

		const newStructure: OracleStructure = {
			name,
			properties: []
		};

		this.oracle.data.structures.push(newStructure);
		return newStructure;
	}


	/**
	 * Updates a structure by its name in the Oracle data structures collection.
	 *
	 * @param {string} name - The name of the structure to be updated.
	 * @param {OracleStructure} structure - The new structure object to replace the existing one.
	 * @return {boolean} Returns true if the structure was found and updated, otherwise returns false.
	 */
	updateStructureByName(name: string, structure: OracleStructure): boolean {
		const index = this.oracle.data.structures.findIndex(s => s.name === name);

		if (index !== -1) {
			this.oracle.data.structures[index] = structure;
			return true;
		}

		return false;
	}


	/**
	 * Deletes a structure by its name from the list of structures.
	 *
	 * @param {string} name - The name of the structure to be deleted.
	 * @return {boolean} - Returns true if a structure was deleted, otherwise false.
	 */
	deleteStructureByName(name: string): boolean {
		const initialLength = this.oracle.data.structures.length;
		this.oracle.data.structures = this.oracle.data.structures.filter(structure => structure.name !== name);
		return this.oracle.data.structures.length < initialLength;
	}

	// ==================== Enumerations ====================


	/**
	 * Creates a new enumeration with the specified name if it does not already exist.
	 *
	 * @param {string} name - The name of the enumeration to be created.
	 * @return {OracleEnumeration | null} The newly created enumeration if successful, or null if an enumeration with the specified name already exists.
	 */
	createEnumeration(name: string): OracleEnumeration | null {
		if (this.oracle.data.enumerations.some(enumeration => enumeration.name === name)) {
			return null; // Skip creation if name already exists
		}

		const newEnumeration: OracleEnumeration = {
			name,
			values: []
		};

		this.oracle.data.enumerations.push(newEnumeration);
		return newEnumeration;
	}


	/**
	 * Updates an existing enumeration by its name with the provided enumeration object.
	 *
	 * @param {string} name - The name of the enumeration to update.
	 * @param {OracleEnumeration} enumeration - The new enumeration object to replace the existing one.
	 * @return {boolean} Returns true if the enumeration was successfully updated, or false if no enumeration with the given name was found.
	 */
	updateEnumerationByName(name: string, enumeration: OracleEnumeration): boolean {
		const index = this.oracle.data.enumerations.findIndex(e => e.name === name);

		if (index !== -1) {
			this.oracle.data.enumerations[index] = enumeration;
			return true;
		}

		return false;
	}


	/**
	 * Deletes an enumeration by its name from the list of enumerations.
	 *
	 * @param {string} name - The name of the enumeration to be deleted.
	 * @return {boolean} Returns true if the enumeration was found and deleted, otherwise false.
	 */
	deleteEnumerationByName(name: string): boolean {
		const initialLength = this.oracle.data.enumerations.length;
		this.oracle.data.enumerations = this.oracle.data.enumerations.filter(enumeration => enumeration.name !== name);
		return this.oracle.data.enumerations.length < initialLength;
	}

	// ==================== Masks ====================


	/**
	 * Creates a new mask with the specified name if it does not already exist.
	 *
	 * @param {string} name - The name of the mask to create.
	 * @return {OracleMask | null} Returns the newly created OracleMask object if the name does not already exist, otherwise returns null.
	 */
	createMask(name: string): OracleMask | null {
		if (this.oracle.data.masks.some(mask => mask.name === name)) {
			return null; // Skip creation if name already exists
		}

		const newMask: OracleMask = {
			name,
			regex: "",
			substitution: ""
		};

		this.oracle.data.masks.push(newMask);
		return newMask;
	}



	/**
	 * Updates the mask object in the oracle data by matching the specified name.
	 * If no mask with the given name is found, no updates are made.
	 *
	 * @param {string} name - The name of the oracle mask to update.
	 * @param {OracleMask} mask - The new mask object to replace the existing one with the same name.
	 * @return {boolean} - Returns true if the mask was successfully updated, otherwise returns false.
	 */
	updateMaskByName(name: string, mask: OracleMask): boolean {
		const index = this.oracle.data.masks.findIndex(m => m.name === name);

		if (index !== -1) {
			this.oracle.data.masks[index] = mask;
			return true;
		}

		return false;
	}


	/**
	 * Deletes a mask with the specified name from the list of masks.
	 *
	 * @param {string} name - The name of the mask to be deleted.
	 * @return {boolean} Returns true if a mask with the specified name was deleted, otherwise false.
	 */
	deleteMaskByName(name: string): boolean {
		const initialLength = this.oracle.data.masks.length;
		this.oracle.data.masks = this.oracle.data.masks.filter(mask => mask.name !== name);
		return this.oracle.data.masks.length < initialLength;
	}

	// ==================== Service Inputs ====================


	/**
	 * Creates a new service input field for a given service name and input name.
	 * If the service is not found or the input already exists, it returns null.
	 *
	 * @param {string} serviceName - The name of the service where the new input field will be added.
	 * @param {string} name - The name of the input field to be created.
	 * @return {OracleServiceInputField | null} The created input field object if successful, or null if the service is not found or the input already exists.
	 */
	createServiceInput(serviceName: string, name: string): OracleServiceInputField | null {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return null;

		if (service.request.some(value => value.name === name)) return null;

		const newInput: OracleServiceInputField = {
			name,
			type: sdk.utils.data.createType({
				public: true,
				type: sdk.constants.DATA.STRING
			})
		};

		service.request.push(newInput);
		return newInput;
	}


	/**
	 * Updates the specified input field for a given service request.
	 *
	 * @param {string} serviceName - The name of the service to update.
	 * @param {string} inputName - The name of the input field to update within the service request.
	 * @param {OracleServiceInputField} input - The new input field data to replace the existing one.
	 * @return {boolean} Returns true if the input field was updated successfully, otherwise returns false.
	 */
	updateServiceInput(serviceName: string, inputName: string, input: OracleServiceInputField): boolean {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return false;

		const index = service.request.findIndex(i => i.name === inputName);
		if (index !== -1) {
			service.request[index] = input;
			return true;
		}

		return false;
	}


	/**
	 * Deletes a service input by its name from a specified service.
	 *
	 * @param {string} serviceName - The name of the service from which the input should be deleted.
	 * @param {string} inputName - The name of the input to delete from the specified service.
	 * @return {boolean} Returns true if the input was successfully deleted, otherwise false.
	 */
	deleteServiceInputByName(serviceName: string, inputName: string): boolean {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return false;

		const initialLength = service.request.length;
		service.request = service.request.filter(input => input.name !== inputName);
		return service.request.length < initialLength;
	}

	// ==================== Service Outputs ====================


	/**
	 * Creates and adds a new `OracleServiceOutputField` to the specified service's answer list if it
	 * does not already exist. Returns the newly created output field or `null` if the service or
	 * field with the provided name does not exist.
	 *
	 * @param {string} serviceName - The name of the service where the output field should be added.
	 * @param {string} name - The name of the output field to be created.
	 * @return {OracleServiceOutputField | null} The newly created output field, or `null` if the
	 * service or field with the specified name does not exist.
	 */
	createServiceOutput(serviceName: string, name: string): OracleServiceOutputField | null {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return null;
		if (service.answer.some(o => o.name === name)) return null;

		const newOutput: OracleServiceOutputField = {
			name,
			type: sdk.utils.data.createType({
				type: sdk.constants.DATA.STRING,
				public: true,
			}),
		};

		service.answer.push(newOutput);
		return newOutput;
	}


	/**
	 * Updates the output field of a specific service by its name in the Oracle service data.
	 *
	 * @param {string} serviceName - The name of the service to be updated.
	 * @param {string} outputName - The name of the output field to be updated.
	 * @param {OracleServiceOutputField} output - The new output field object containing updated data.
	 * @return {boolean} Returns true if the output field was successfully updated, otherwise false if the service or output field is not found.
	 */
	updateServiceOutput(serviceName: string, outputName: string, output: OracleServiceOutputField): boolean {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return false;

		const index = service.answer.findIndex(o => o.name === outputName);
		if (index !== -1) {
			service.answer[index] = output;
			return true;
		}

		return false;
	}

	/**
	 * Updates a field in the specified structure with new field data.
	 *
	 * @param {string} structureName - The name of the structure to update.
	 * @param {string} fieldName - The name of the field to update within the structure.
	 * @param {OracleStructureField} field - The new field data to replace the existing field.
	 * @return {boolean} Returns true if the specified field is successfully updated or added,
	 *                   otherwise returns false if the structure does not exist.
	 */
	updateStructureField(structureName: string, fieldName: string, field: OracleStructureField) {
		const structure = this.oracle.data.structures.find(s => s.name === structureName);
		if (!structure) return false;

		const index = structure.properties.findIndex(f => f.name === fieldName);
		if (index !== -1) {
			structure.properties[index] = field;
			return true;
		}

		return true;
	}


	/**
	 * Deletes a specific service output by its name.
	 *
	 * @param {string} serviceName - The name of the service where the output resides.
	 * @param {string} outputName - The name of the output to be deleted.
	 * @return {boolean} - Returns true if the output was successfully deleted, otherwise false.
	 */
	deleteServiceOutputByName(serviceName: string, outputName: string): boolean {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return false;

		const initialLength = service.request.length;
		service.answer = service.answer.filter(output => output.name !== outputName);
		return service.request.length < initialLength;
	}

// ==================== Structure Fields ====================


	/**
	 * Creates a new structure field with the specified name within a given structure.
	 *
	 * @param {string} structureName - The name of the structure where the new field will be added.
	 * @param {string} name - The name of the new field to be created.
	 * @return {OracleStructureField | null} The newly created field if successful, or null if the structure does not exist or the field already exists.
	 */
	createStructureField(structureName: string, name: string): OracleStructureField | null {
		const structure = this.oracle.data.structures.find(s => s.name === structureName);
		if (!structure) return null;
		if (structure.properties.some(f => f.name === name)) return null;

		const newField: OracleStructureField = {
			name,
			type: sdk.utils.data.createType({
				type: sdk.constants.DATA.STRING,
				public: true,
			}),
		};

		structure.properties.push(newField);
		return newField;
	}

	/**
	 * Deletes a field from a structure based on its name.
	 *
	 * @param {string} structureName - The name of the structure from which the field should be removed.
	 * @param {string} fieldName - The name of the field to be deleted.
	 * @return {boolean} Returns true if the field was successfully deleted, otherwise false.
	 */
	deleteStructureFieldByName(structureName: string, fieldName: string) {
		const structure = this.oracle.data.structures.find(s => s.name === structureName);
		if (!structure) return false;

		const initialLength = structure.properties.length;
		structure.properties = structure.properties.filter(field => field.name !== fieldName);
		return structure.properties.length < initialLength;
	}

	// ==================== Enumeration Values ====================


	/**
	 * Adds a new value to the specified enumeration if it exists and the value is not already included.
	 *
	 * @param {string} enumerationName - The name of the enumeration to which the value will be added.
	 * @param {string} value - The value to be added to the enumeration.
	 * @return {boolean} - Returns true if the value was successfully added, otherwise false.
	 */
	addEnumerationValue(enumerationName: string, value: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.name === enumerationName);
		if (!enumeration || enumeration.values.includes(value)) return false;

		enumeration.values.push(value);
		return true;
	}




	/**
	 * Removes a specified value from an enumeration within the given oracle data structure.
	 *
	 * @param {string} enumerationName - The name of the enumeration from which the value should be removed.
	 * @param {string} value - The value to be removed from the enumeration.
	 * @return {boolean} Returns true if the value was successfully removed, otherwise false.
	 */
	removeEnumerationValue(enumerationName: string, value: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.name === enumerationName);
		if (!enumeration) return false;

		const initialLength = enumeration.values.length;
		enumeration.values = enumeration.values.filter(v => v !== value);
		return enumeration.values.length < initialLength;
	}


}