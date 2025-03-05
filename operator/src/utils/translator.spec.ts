import { CarmentisTranslator } from './translator';
import { FieldDataType } from '../workspace-api/types/data.type';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { OracleDataType } from '../workspace-api/types/oracle-data.type';

describe('Oracle translation', () => {
	it("should work for empty oracle", () => {
		const results = CarmentisTranslator.translateOracleToCarmentis({});
		Object.values(results).forEach((value) => {
			expect(Array.isArray(value)).toEqual(true)
			expect(value.length).toEqual(0)
		})
	})

	it("should work for a single structure without properties", () => {
		const results = CarmentisTranslator.translateOracleToCarmentis({
			structures: [{
				id: "id",
				name: 'Structure',
				properties: []
			}]
		});

		// all values should be arrays
		Object.values(results).forEach((value) => {
			expect(Array.isArray(value)).toEqual(true)
		})

		expect(results.internalStructures.length).toEqual(1)
		expect(results.services.length).toEqual(0)
		expect(results.masks.length).toEqual(0)
		expect(results.enumerations.length).toEqual(0)
	})

	it("should work for a single structure with primitive properties", () => {
		const p1 : FieldDataType = {
			array: true,
			id: 'p1',
			kind: 'primitive',
			name: 'p1',
			required: true,
			type: {
				id: 'STRING',
				private: true,
				hashable: true,
			}
		}
		const p2 : FieldDataType = {
			array: false,
			id: 'p2',
			kind: 'primitive',
			name: 'p2',
			required: false,
			type: {
				id: 'INT',
				private: false,
				hashable: false,
			}
		}

		const results = CarmentisTranslator.translateOracleToCarmentis({
			structures: [{
				id: "id",
				name: 'Structure',
				properties: [p1, p2]
			}]
		});

		// all values should be arrays
		Object.values(results).forEach((value) => {
			expect(Array.isArray(value)).toEqual(true)
		})

		// test the result
		expect(results.internalStructures.length).toEqual(1)
		expect(results.services.length).toEqual(0)
		expect(results.masks.length).toEqual(0)
		expect(results.enumerations.length).toEqual(0)

		// test the produced structure
		const s = results.internalStructures[0];
		expect(s.name).toEqual('Structure')
		expect(s.properties.length).toEqual(2)

		// test the fields
		const couples = [
			{source: p1, translated: s.properties[0]},
			{source: p2, translated: s.properties[1]},
		];
		couples.forEach(({source, translated}) => {
			expect(translated.name).toEqual(source.name)
			expect(sdk.utils.data.isPrivate(translated.type)).toEqual(source.type.private)
			expect(sdk.utils.data.isPrimitive(translated.type)).toEqual(source.kind === 'primitive')
			expect(sdk.utils.data.isArray(translated.type)).toEqual(source.array)
			expect(sdk.utils.data.isOptional(translated.type)).toEqual(!source.required)
			expect(sdk.utils.data.isHashable(translated.type)).toEqual(source.type.hashable)
			expect(sdk.utils.data.getPrimitiveType(translated.type)).toEqual(sdk.constants.DATA.PrimitiveTypes[source.type.id])
		})
	})


	it("should work for a two structures with structures properties", () => {
		const p : FieldDataType = {
			array: true,
			id: 'p',
			kind: 'structure',
			name: 'p',
			required: true,
			type: {
				id: 's2',
			}
		}

		const results = CarmentisTranslator.translateOracleToCarmentis({
			structures: [
				{
					id: "s1",
					name: 'Initial Structure',
					properties: [p]
				},
				{
					id: "s2",
					name: 'Referred Structure',
					properties: []
				},
			]
		});

		// all values should be arrays
		Object.values(results).forEach((value) => {
			expect(Array.isArray(value)).toEqual(true)
		})

		// test the result
		expect(results.internalStructures.length).toEqual(2)
		expect(results.services.length).toEqual(0)
		expect(results.masks.length).toEqual(0)
		expect(results.enumerations.length).toEqual(0)

		// test the produced structure
		const s = results.internalStructures[0];
		expect(s.name).toEqual('Initial Structure')
		expect(s.properties.length).toEqual(1)

		// test the fields
		const couples = [
			{source: p, translated: s.properties[0]},
		];
		couples.forEach(({source, translated}) => {
			expect(translated.name).toEqual(source.name)
			expect(sdk.utils.data.isPrimitive(translated.type)).toEqual(false)
			expect(sdk.utils.data.isStruct(translated.type)).toEqual(true)
			expect(sdk.utils.data.isEnum(translated.type)).toEqual(false)
			expect(sdk.utils.data.getObjectIndex(translated.type)).toEqual(1)
		})
	})

	it('should not work when duplicates ids are found', () => {
		const p : FieldDataType = {
			array: true,
			id: 'p',
			kind: 'structure',
			name: 'p',
			required: true,
			type: {
				id: 's1',
			}
		}
		const struct = {
				id: "s1",
				name: 'Initial Structure',
				properties: [p, p]
			}

		const s : OracleDataType = {
			structures: [struct, struct, struct],
			enumerations: [
				{
					id: 's1',
					name: 'Enumeration',
					values: [],
				},
			]
		}
		expect(() => {
			CarmentisTranslator.translateOracleToCarmentis(s);
		}).toThrow()

		const builder = CarmentisTranslator.buildOracleToTranslator();
		try {
			builder.translate(s);
		} catch (e) {
		}
		console.log(builder.getErrors())
		expect(builder.getErrors().length).toEqual(2)

	})

	it('should not work when ids reference undefined elements', () => {
		const p : FieldDataType = {
			array: true,
			id: 'p',
			kind: 'structure',
			name: 'p',
			required: true,
			type: {
				id: 'undefined-structure',
			}
		}
		const struct = {
			id: "s",
			name: 'Initial Structure',
			properties: [p, p]
		}

		const s : OracleDataType = {
			structures: [struct, struct, struct],
			enumerations: [
				{
					id: 's1',
					name: 'Enumeration',
					values: [],
				},
			]
		}
		expect(() => {
			CarmentisTranslator.translateOracleToCarmentis(s);
		}).toThrow()
	})

	it('should not work when a name is empty', () => {
		const p : FieldDataType = {
			array: true,
			id: 'p',
			kind: 'structure',
			name: '',
			required: true,
			type: {
				id: 's',
			}
		}
		const struct = {
			id: "s",
			name: '',
			properties: [p, p]
		}

		const s : OracleDataType = {
			structures: [struct],
			enumerations: [
				{
					id: 's1',
					name: '',
					values: [],
				},
			]
		}
		expect(() => {
			CarmentisTranslator.translateOracleToCarmentis(s);
		}).toThrow()
	})

	it('should not work when a type is undefined', () => {
		const p : FieldDataType = {
			array: true,
			id: 'p',
			kind: 'undefined',
			name: 'undefinedField',
			required: true,
		}
		const struct = {
			id: "s",
			name: 'myStruct',
			properties: [p]
		}

		const s : OracleDataType = {
			structures: [struct],
		}
		const builder = CarmentisTranslator.buildOracleToTranslator();
		expect(() => {
			builder.translate(s);
		}).toThrow()
		expect(builder.getErrors().length).toEqual(1)
	})
})