export abstract class AbstractBuilder<T> {
	private fields : Field[];
	private structures: Structure[]
	private errors: string[];

	constructor() {
		this.fields = []
		this.structures = []
	}

	addField( field: Field ) {
		// no field with the same name
		const fieldName = field.getFieldName();
		if (this.fields.some(f => f.getFieldName() === fieldName)) {
			this.addError(`Two fields share the same name: ${fieldName} `)
		}
		this.fields.push( field );
	}

	addStructure( structure: Structure ) {
		// no structure with the same name
		const name = structure.getStructureName();
		if (this.structures.some(f => f.getStructureName() === name)) {
			this.addError(`Two structures share the same name: ${name} `)
		}
		this.structures.push( structure );
	}

	abstract build(): T;

	protected addError( error: string ) {
		this.errors.push(error);
	}
}

export class ApplicationBuilder extends AbstractBuilder<{}> {
	build() {
		return {}
	}
}


export class Structure {
	constructor(
		private readonly structureName: string,
		private readonly fields: Field[],
	) {}

	getStructureName() { return this.structureName }
}

export class Field {
	constructor(
		private readonly fieldName: string,
		private readonly isRequired: boolean,
		private readonly isArray: boolean
	) {}

	getFieldName() { return this.fieldName }
	getIsRequired() { return this.isRequired }
	getIsArray() { return this.isArray }

}

export class PrimitiveField extends Field {
	private maskName?: string;

	constructor(
		fieldName: string,
		isRequired: boolean,
		isArray: boolean,
		private readonly type: string,
		private readonly isPublic: string,
		private readonly isHashable: boolean
	) {
		super(fieldName, isRequired, isArray);
		this.maskName = undefined;
	}

	getType(): string { return this.type; }
	getIsPublic() { return this.isPublic }
	getIsHashable() { return this.isHashable }
	hasMask() { return this.maskName !== undefined;  }
	setMask(maskName: string) { this.maskName = maskName; }
}

export class StructureField extends Field {
	constructor(
		fieldName: string,
		isRequired: boolean,
		isArray: boolean,
		private structureName: string
	) {
		super(fieldName, isRequired, isArray);
	}
	getStructureName() { return this.structureName }
}

export class EnumerationField extends Field {
	constructor(
		fieldName: string,
		isRequired: boolean,
		isArray: boolean,
		private enumerationName
	) {
		super(fieldName, isRequired, isArray);
	}
	getEnumerationName() { return this.enumerationName }
}

export class OracleAnswerField extends Field {
	constructor(
		fieldName: string,
		isRequired: boolean,
		isArray: boolean,
		private oracleAnswerName: string
	) {
		super(fieldName, isRequired, isArray);
	}
	getOracleAnswerName() { return this.oracleAnswerName }
}







