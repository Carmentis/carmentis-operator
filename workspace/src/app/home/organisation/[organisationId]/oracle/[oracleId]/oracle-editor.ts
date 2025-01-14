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
import * as sdk from '@cmts-dev/carmentis-sdk';

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

	deleteServiceByName(name: string): boolean {
		const initialLength = this.oracle.data.services.length;

		// Filter out the service with the given ID
		this.oracle.data.services = this.oracle.data.services.filter(service => service.name !== name);

		// Return true if an element was removed, otherwise false
		return this.oracle.data.services.length < initialLength;
	}


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


	updateStructureByName(name: string, structure: OracleStructure): boolean {
		const index = this.oracle.data.structures.findIndex(s => s.name === name);

		if (index !== -1) {
			this.oracle.data.structures[index] = structure;
			return true;
		}

		return false;
	}


	deleteStructureByName(name: string): boolean {
		const initialLength = this.oracle.data.structures.length;
		this.oracle.data.structures = this.oracle.data.structures.filter(structure => structure.name !== name);
		return this.oracle.data.structures.length < initialLength;
	}

	// ==================== Enumerations ====================


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


	updateEnumerationByName(name: string, enumeration: OracleEnumeration): boolean {
		const index = this.oracle.data.enumerations.findIndex(e => e.name === name);

		if (index !== -1) {
			this.oracle.data.enumerations[index] = enumeration;
			return true;
		}

		return false;
	}


	deleteEnumerationByName(name: string): boolean {
		const initialLength = this.oracle.data.enumerations.length;
		this.oracle.data.enumerations = this.oracle.data.enumerations.filter(enumeration => enumeration.name !== name);
		return this.oracle.data.enumerations.length < initialLength;
	}

	// ==================== Masks ====================


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



	updateMaskByName(name: string, mask: OracleMask): boolean {
		const index = this.oracle.data.masks.findIndex(m => m.name === name);

		if (index !== -1) {
			this.oracle.data.masks[index] = mask;
			return true;
		}

		return false;
	}


	deleteMaskByName(name: string): boolean {
		const initialLength = this.oracle.data.masks.length;
		this.oracle.data.masks = this.oracle.data.masks.filter(mask => mask.name !== name);
		return this.oracle.data.masks.length < initialLength;
	}

	// ==================== Service Inputs ====================


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


	deleteServiceInputByName(serviceName: string, inputName: string): boolean {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return false;

		const initialLength = service.request.length;
		service.request = service.request.filter(input => input.name !== inputName);
		return service.request.length < initialLength;
	}

	// ==================== Service Outputs ====================


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


	deleteServiceOutputByName(serviceName: string, outputName: string): boolean {
		const service = this.oracle.data.services.find(s => s.name === serviceName);
		if (!service) return false;

		const initialLength = service.request.length;
		service.answer = service.answer.filter(output => output.name !== outputName);
		return service.request.length < initialLength;
	}

// ==================== Structure Fields ====================


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

	deleteStructureFieldByName(structureName: string, fieldName: string) {
		const structure = this.oracle.data.structures.find(s => s.name === structureName);
		if (!structure) return false;

		const initialLength = structure.properties.length;
		structure.properties = structure.properties.filter(field => field.name !== fieldName);
		return structure.properties.length < initialLength;
	}

	// ==================== Enumeration Values ====================


	addEnumerationValue(enumerationName: string, value: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.name === enumerationName);
		if (!enumeration || enumeration.values.includes(value)) return false;

		enumeration.values.push(value);
		return true;
	}


	updateEnumerationValue(enumerationName: string, oldValue: string, newValue: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.name === enumerationName);
		if (!enumeration) return false;

		const index = enumeration.values.indexOf(oldValue);
		if (index !== -1) {
			enumeration.values[index] = newValue;
			return true;
		}

		return false;
	}


	removeEnumerationValue(enumerationName: string, value: string): boolean {
		const enumeration = this.oracle.data.enumerations.find(e => e.name === enumerationName);
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