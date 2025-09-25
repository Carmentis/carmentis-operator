import {
	ZodArray,
	ZodBoolean,
	ZodDefault,
	ZodEnum,
	ZodNumber,
	ZodObject,
	ZodOptional,
	ZodString,
	ZodTypeAny,
} from 'zod';



export type LeafDoc = {
	type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'unknown';
	description?: string;
	required: boolean;
	defaultValue?: unknown;
	properties?: Record<string, LeafDoc>; // pour les objets
	items?: LeafDoc; // pour les arrays
	enumValues?: string[]; // pour les enums
};

export function schemaToJson(schema: ZodTypeAny): LeafDoc {
	// Gestion des optional()
	if (schema instanceof ZodOptional) {
		const inner = schema.unwrap();
		const result = schemaToJson(inner);
		result.description = schema._def.description;
		result.required = false;
		return result;
	}

	// Gestion des default()
	if (schema instanceof ZodDefault) {
		const inner = schema.removeDefault();
		const result = schemaToJson(inner);

		result.description = schema._def.description;
		result.defaultValue = schema._def.defaultValue();
		result.required = false;
		return result;
	}

	// Gestion des objets
	if (schema instanceof ZodObject) {
		const shape = schema.shape;
		const properties: Record<string, LeafDoc> = {};
		for (const key in shape) {
			properties[key] = schemaToJson(shape[key]);
		}
		return {
			type: 'object',
			description: schema._def.description,
			required: true,
			properties,
		};
	}

	// Gestion des arrays
	if (schema instanceof ZodArray) {
		const inner = schemaToJson(schema.element);
		return {
			type: 'array',
			description: schema._def.description,
			required: true,
			items: inner,
		};
	}

	// Gestion des enums
	if (schema instanceof ZodEnum) {
		return {
			type: 'enum',
			description: schema._def.description,
			required: true,
			enumValues: schema.options,
		};
	}

	// Feuilles simples (string, number, boolean, etc.)
	const type = schema instanceof ZodString
		? 'string'
		: schema instanceof ZodNumber
			? 'number'
			: schema instanceof ZodBoolean
				? 'boolean'
				: 'unknown';

	return {
		type,
		description: schema._def.description,
		required: true,
	};
}