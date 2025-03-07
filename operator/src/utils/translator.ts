import { OracleDataType, OracleServiceDataType } from '../workspace-api/types/oracle-data.type';
import {
	CarmentisApplicationDataType,
	CarmentisEnumerationDataType,
	CarmentisFieldDataType, CarmentisMaskDataType, CarmentisMessageDataType, CarmentisOracleAnswerDataType,
	CarmentisOracleDataType,
	CarmentisOracleServiceDataType, CarmentisStructureDataType,
} from '../workspace-api/types/carments-data.type';
import {
	DataOracle,
	EnumerationDataType,
	FieldDataType,
	MaskDataType,
	MessageDataType,
	StructureDataType,
} from '../workspace-api/types/data.type';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import * as assert from 'node:assert';
import { ApplicationDataType } from '../workspace-api/types/application-data.type';


export class CarmentisTranslator {
	static translateOracleToCarmentis(oracle: OracleDataType) : CarmentisOracleDataType {
		return this.buildOracleToTranslator().translate(oracle)
	}

	static buildOracleToTranslator() : OracleForwardTranslator {
		return new OracleForwardTranslator()
	}

	static buildApplicationTranslator() : ApplicationForwardTranslator {
		return new ApplicationForwardTranslator()
	}
}

interface Translator<A, B> {
	translate(input: A): B
}

abstract class AbstractTranslator<A, B> implements Translator<A, B> {
	private source: A;
	private errors: string[];
	
	constructor() {
		this.errors = [];
	}

	getSource(): A {
		return {...this.source}
	}
	
	protected addError(error: string) {
		this.errors.push(error);
	}
	
	getErrors() : string[] {
		return [...this.errors]
	}
	
	hasErrors(): boolean {
		return this.errors.length > 0;
	}
	
	translate(input: A): B {
		this.source = input;
		this.errors = [];
		this.checkConsistencyOfSource();
		if (this.hasErrors()) throw `Found inconsistency in the  provided source: found ${this.errors.length} errors: ${this.errors.join(', ')}`;
		return this.translateSource(input);
	}


	protected abstract checkConsistencyOfSource() : void;
	protected abstract translateSource(input: A): B;

}

abstract class CarmentisForwardTranslator<A,B> extends AbstractTranslator<A, B> {

	protected findRecursively<R>(
		predicate : (
			location: string,
			node: Record<string, any>
		) => { triggered: true, response: R } | { triggered: false }
	) : R[]
	{
		const explore = ( path: string[], data: Record<string, any> ) => {
			const foundIds = []
			if (typeof data !== 'object') return foundIds;
			const response = predicate(path.join("."), data);
			if ( response.triggered ){
				foundIds.push( response.response );
			}
			return Object.entries(data).reduce((previousValue, currentValue) => {
				const [k, v] = currentValue;
				const searchResult = explore([...path, k], v);
				return [...previousValue, ...searchResult];
			}, foundIds)
		}
		return explore([], this.getSource())
	}

	protected findAllIdentifiers(): {location: string, id: string}[] {
		const response = this.findRecursively<{location: string, id: string}>(
			(location, node) => {
				if ( 'id' in node && 'name' in node ) {
					return {
						triggered: true,
						response: {
							location: location,
							id: node.id
						}
					}
				}
				return { triggered: false }
			}
		)
		return response
	}

	protected findAllReferencedIdentifiers(): {location: string, id: string}[] {
		return this.findRecursively(
			(location, node) => {
				const typeIsDefined = 'type' in node && 'id' in node.type;
				const isPrimitive = 'kind' in node && node.kind == 'primitive';
				if (  typeIsDefined && !isPrimitive ) {
					return {
						triggered: true,
						response: {
							location: location,
							id: node.type.id
						}
					}
				}
				return { triggered: false }
			}
		)
	}


	protected findAllNamesByIdentifier( id: string ) {
		return this.findRecursively(
			(location, node) => {
				const triggered = 'id' in node && 'name' in node && node.id == id
				if ( triggered ) {
					return {
						triggered: true,
						response: [node.name]
					}
				}
				return { triggered: false }
			}
		)
	}

	protected findAllEmptyNames() {
		return this.findRecursively(
			(location, node) => {
				const triggered = 'id' in node && 'name' in node && node.name == ''
				if ( triggered ) {
					return {
						triggered: true,
						response: { location }
					}
				}
				return { triggered: false }
			}
		)
	}

	protected findAllUndefinedFields() {
		return this.findRecursively(
			(location, node) => {
				const triggered =
					'id' in node &&
					'name' in node &&
					'kind' in node &&
					node.kind == 'undefined'
				if ( triggered ) {
					return {
						triggered: true,
						response: { location }
					}
				}
				return { triggered: false }
			}
		)
	}

	protected findFieldsWithUndefinedType() {
		return this.findRecursively(
			(location, node) => {
				const triggered =
					'id' in node &&
					'name' in node &&
					'kind' in node &&
					'type' in node &&
					node.kind !== 'undefined' &&
					!('id' in node.type)
				if ( triggered ) {
					return {
						triggered: true,
						response: { location }
					}
				}
				return { triggered: false }
			}
		)
	}

	protected findIndexAndLocationByIdentifier( id: string ) {
		const explore = ( path: string[], data: Record<string, any> ) => {
			if (typeof data !== 'object') return [];
			return Object.entries(data).reduce((prev, curr) => {
				const [k, v] = curr;
				if (Array.isArray(v) && v.every(el => 'id' in el && 'name' in el)) {
					const result = v.findIndex(el => el.id === id)
					return result == -1 ? prev : [...prev, { index: result, location: path }]
				} else {
					return explore([...path, k], v)
				}
			}, [])
		}
		const result = explore([], this.getSource())
		assert(result.length === 1, 'Too much indexes found')
		return result;
	}

	protected findIndexByIdentifier(  id: string ) {
		const foundIndex: number[] = this.findIndexAndLocationByIdentifier(id).map(el => el.index)
		assert(foundIndex.length !== 0, `No element found with id ${id}`)
		assert(foundIndex.length === 1, `Too much indexes found for id ${id} (found ${foundIndex.length} elements)`)
		return foundIndex[0]
	}

	protected findOneNameByIdentifier( id: string ) {
		const results = this.findAllNamesByIdentifier(id)
		if (results.length === 0) throw `No element found with id ${id}`;
		if (results.length !== 1) throw `Too much elements found with id ${id}: ${results}`
		return results[0]
	}


	protected translateStructure( structure: StructureDataType ): CarmentisStructureDataType {
		return {
			name: structure.name,
			properties: structure.properties.map(f => this.translateField(f)),
		}
	}




	protected translateField( field: FieldDataType ) : CarmentisFieldDataType {
		// TODO handle the mask
		const name = field.name;
		let type = sdk.utils.data.createType({
			public: field.kind === 'primitive' ? !field.type.private : undefined,
			hashable: field.kind === 'primitive' ? field.type.hashable : undefined,
			optional: !field.required,
			array: field.array,
			type: field.kind === 'primitive' ? this.mapTypeOfPrimitiveFieldWithCarmentisType(field) : 0,
		})


		let structType = undefined;
		if (field.kind === 'structure') {
			structType = sdk.constants.DATA.STRUCT_INTERNAL;
			const index = this.findIndexByIdentifier(field.type.id)
			type = type | sdk.constants.DATA.STRUCT | index;
		} else if (field.kind === 'oracleAnswer') {
			structType = sdk.constants.DATA.STRUCT_ORACLE;
			const index = this.findIndexByIdentifier(field.type.id)
			type = type | sdk.constants.DATA.STRUCT | index;
		} else if (field.kind === 'enumeration') {
			const index = this.findIndexByIdentifier(field.type.id)
			type = type | sdk.constants.DATA.ENUM | index;
		}


		return {
			name,
			type,
			structType
		}
	}

	protected translateEnumeration( enumeration: EnumerationDataType ) : CarmentisEnumerationDataType {
		return {
			...enumeration
		}
	}

	protected translateMask( mask: MaskDataType ) : CarmentisMaskDataType {
		return {
			...mask
		}
	}



	private mapTypeOfPrimitiveFieldWithCarmentisType( field: FieldDataType ) : number {
		assert(field.kind === 'primitive', `The conversion of a primitive field to Carmentis type system can only be performed with primitive fields: got ${field.kind}`);
		return sdk.constants.DATA.PrimitiveTypes[field.type.id];
	}

	protected checkConsistencyOfSource() {
		// search for duplicated identifiers
		const ids = this.findAllIdentifiers();
		const duplicatedIds = this.findDuplicates(ids.map(el => el.id));
		if (duplicatedIds.length !== 0) {
			for (const duplicatedId of duplicatedIds) {
				const duplicatedIdsLocation = ids
					.filter(el => el.id == duplicatedId)
					.map(el => el.location);
				this.addError(`Found duplicated ids ${duplicatedId} at locations ${duplicatedIdsLocation.join(', ')}`)
			}
		}

		// search for undefined referenced identifiers
		const referencedIds = this.findAllReferencedIdentifiers();
		for (const referencedId of referencedIds) {
			if (!ids.find(p => p.id == referencedId.id)) {
				this.addError(`Found reference of id ${referencedId.id} at location ${referencedId.location} but no definition.`);
			}
		}

		// search for empty names
		const emptyNameLocations = this.findAllEmptyNames();
		for (const location of emptyNameLocations) {
			this.addError(`Found empty name at location ${location.location}.`);
		}

		// search for undefined types
		const undefinedTypeLocations = this.findAllUndefinedFields();
		for (const location of undefinedTypeLocations) {
			this.addError(`Found undefined field at location ${location.location}.`);
		}

		// search for defined kinds with undefined type
		const invalidFields = this.findFieldsWithUndefinedType();
		for ( const field of invalidFields ) {
			this.addError(`Found field without associated element at location ${field.location}.`);
		}
	}

	private findDuplicates<T>(array: T[]): T[] {
		const seen = new Set<T>();
		const duplicates = new Set<T>();

		for (const item of array) {
			if (seen.has(item)) {
				duplicates.add(item);
			} else {
				seen.add(item);
			}
		}

		return Array.from(duplicates);
	}
}


class OracleForwardTranslator extends CarmentisForwardTranslator<OracleDataType, CarmentisOracleDataType> {


	private translateService( service: OracleServiceDataType ): CarmentisOracleServiceDataType {
		assert( service.id, 'Service id must be defined' );
		assert( typeof service.name === 'string', 'Service name must be a string' );
		const requests = service.request.map(f => this.translateField(f))
		const answers = service.answer.map(f => this.translateField(f))
		return {
			name: service.name,
			request: requests,
			answer: answers
		}
	}

	protected translateSource(): CarmentisOracleDataType {
		const input = this.getSource();
		const services: CarmentisOracleServiceDataType[] = (input.services ?? []).map(s => this.translateService(s));
		const enumerations = (input.enumerations ?? []).map(e => this.translateEnumeration(e))
		const masks = (input.masks ?? []).map(m => this.translateMask(m))
		const structures = (input.structures ?? []).map(s => this.translateStructure(s))

		return {
			enumerations,
			internalStructures: structures,
			masks,
			services
		}
	}
}

class ApplicationForwardTranslator extends CarmentisForwardTranslator<ApplicationDataType, CarmentisApplicationDataType> {


	private translateMessage( message: MessageDataType ): CarmentisMessageDataType {
		assert( message.id, 'Message id must be defined' );
		assert( typeof message.name === 'string', 'Message name must be a string' );
		assert( typeof message.content === 'string', 'Message content must be a string' );
		return {
			content: message.content,
			name: message.name,
		}
	}

	private translateOracleAnswerStructure( oracle: DataOracle ) : CarmentisOracleAnswerDataType {
		return {
			oracle: oracle.oracleHash,
			serviceName: oracle.service,
			version: oracle.version
		}
	}


	protected translateSource(): CarmentisApplicationDataType {
		const input = this.getSource();
		const fields = (input.fields ?? []).map(f => this.translateField(f))
		const enumerations = (input.enumerations ?? []).map(e => this.translateEnumeration(e))
		const masks = (input.masks ?? []).map(m => this.translateMask(m))
		const messages = (input.messages ?? []).map(m => this.translateMessage(m))
		const internalStructures = (input.structures ?? []).map(s => this.translateStructure(s))
		const oracleStructures = (input.oracles ?? []).map(s => this.translateOracleAnswerStructure(s))

		return {
			fields,
			enumerations,
			messages,
			oracleStructures,
			internalStructures,
			masks,
		}
	}
}


