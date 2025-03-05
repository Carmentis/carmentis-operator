import {
	AppDataEnum,
	AppDataField,
	AppDataMask,
	AppDataMessage, AppDataOracle,
	AppDataStruct,
	Application,
} from '@/entities/application.entity';
import { atom } from 'jotai/index';
import {
	applicationAtom,
	applicationIsModifiedAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useAtomValue, useSetAtom } from 'jotai';
import { generateRandomString } from 'ts-randomstring/lib';
import { Oracle } from '@/entities/oracle.entity';

type Action =

	| { type: 'UPDATE_APPLICATION'; payload: { application: Application } }

	| { type: 'ADD_FIELD'; payload: { name: string } }
	| { type: 'EDIT_FIELD'; payload: { fieldId: string, field: AppDataField } }
	| { type: 'REMOVE_FIELD'; payload: { fieldId: string } }

	| { type: 'ADD_STRUCT'; payload: { name: string } }
	| { type: 'EDIT_STRUCT'; payload: { structId: string, struct: AppDataStruct } }
	| { type: 'REMOVE_STRUCT'; payload: { structId: string } }

	| { type: 'ADD_STRUCT_FIELD'; payload: { structId: string, fieldName: string } }
	| { type: 'EDIT_STRUCT_FIELD'; payload: { structId: string, fieldId: string, field: AppDataField } }
	| { type: 'REMOVE_STRUCT_FIELD'; payload: { structId: string, fieldId: string } }

	| { type: 'ADD_MASK'; payload: { name: string } }
	| { type: 'EDIT_MASK'; payload: { maskId: string, mask: AppDataMask } }
	| { type: 'REMOVE_MASK'; payload: { maskId: string } }

	| { type: 'ADD_MESSAGE'; payload: { name: string } }
	| { type: 'EDIT_MESSAGE'; payload: { messageId: string, message: AppDataMessage } }
	| { type: 'REMOVE_MESSAGE'; payload: { messageId: string } }

	| { type: 'ADD_ENUMERATION'; payload: { name: string } }
	| { type: 'EDIT_ENUMERATION'; payload: { enumId: string, enumeration: AppDataEnum } }
	| { type: 'REMOVE_ENUMERATION'; payload: { enumId: string } }
	| { type: 'ADD_ENUMERATION_VALUE'; payload: { enumId: string, value: string } }
	| { type: 'REMOVE_ENUMERATION_VALUE'; payload: { enumId: string, value: string } }

	| { type: 'ADD_ORACLE'; payload: { name: string, oracleHash: string, service: string, version: number } }
	| { type: 'EDIT_ORACLE'; payload: { oracleId: string, oracle: AppDataOracle } }
	| { type: 'REMOVE_ORACLE'; payload: { oracleId: string } };


export function createDefaultField( name: string ) : AppDataField {
	return {
		id: generateRandomString(),
		name,
		array: false,
		required: false,
		kind: 'primitive',
		type: {
			id: 'STRING',
			private: false,
			hashable: false,
			mask: '',
		}
    };
}


export function markStructFieldsLinkedWithEntityWithIdAsUndefined(object: Record<string, any>, id: string): Record<string, any> {
	const processNode = (node: any): any => {
		// If the node isn't an object or array, return it as is
		if (typeof node !== 'object' || node === null) return node;

		// If the current node has both "kind" and "type" fields
		if (node.kind && node.type?.id === id) {
			return {
				...node,
				kind: 'undefined',
				type: {},
			};
		}

		// If node is an array, map through each item
		if (Array.isArray(node)) {
			return node.map(processNode);
		}

		// Otherwise, it's an object. Process its key-value pairs.
		return Object.keys(node).reduce((acc, key) => {
			acc[key] = processNode(node[key]);
			return acc;
		}, {} as Record<string, any>);
	};

	// Start processing the passed object
	return processNode(object);
}

export function unassignedIdOfFields( fields: AppDataField[], id: string ): AppDataField[]  {
	console.log(`removing type of fields associated with ${id}:`, fields)
	return fields.map(f => {
		const kind = f.kind;
		if (kind === 'structure' || kind === 'enumeration') {
			const referencedStructure = f.type?.id;
			if (id === referencedStructure) {
				return {
					...f,
					kind: 'undefined',
					type: {}
				}
			} else {
				return f;
			}
		} else {
			return f;
		}
	})
}



export function addStructure( object: Application | Oracle, structName: string ) {
	const data = object.data
	const structures = data.structures ?? []
	return {
		...object,
		data: {
			...data,
			structures: [...structures, {
				id: generateRandomString(),
				name: structName,
				properties: []
			}],
		}
	}
}

export function editStructure( object: Application | Oracle, structId: string, struct: AppDataStruct ) {
	const data = object.data
	const structures = data.structures ?? []
	return {
		...object,
		data: {
			...data,
			structures: structures
				.map(
					s => s.id === structId ? struct : s
				)
		},
	}
}

export function removeStructure( object: Application | Oracle, structId: string ) {
	const data = object.data
	const structures = (data.structures ?? [])
			.filter(s => s.id !== structId);
	const updatedObject = {
		...object,
		data: {
			...data,
			structures
		},
	}

	return markStructFieldsLinkedWithEntityWithIdAsUndefined(updatedObject, structId)
}


export function removeEnumeration( object: Application | Oracle, enumId: string ) {
	const data = object.data
	const enumerations = (data.enumerations ?? [])
		.filter(e => e.id !== enumId);
	const updatedObject = {
		...object,
		data: {
			...data,
			enumerations
		},
	}

	return markStructFieldsLinkedWithEntityWithIdAsUndefined(updatedObject, enumId)
}




const applicationReducer = (application: Application | undefined, action: Action): Application | undefined => {
	if (!application) return application;

	// prevent empty data
	const fields = application.data.fields ?? [];
	const structures = application.data.structures ?? []
	const messages = application.data.messages ?? [];
	const masks = application.data.masks ?? [];
	const enumerations = application.data.enumerations ?? [];
	const oracles = application.data.oracles ?? [];

	switch (action.type) {
		case 'UPDATE_APPLICATION':
			return action.payload.application

		case 'ADD_FIELD':
			return {
				...application,
				data: {
					...application.data,
					fields: [...fields, createDefaultField(action.payload.name)],
				},
			};

		case 'EDIT_FIELD':
			return {
				...application,
				data: {
					...application.data,
					fields: fields
						.map(
							f => f.id === action.payload.fieldId ? action.payload.field : f
						)
				},
			};

		case 'REMOVE_FIELD':
			return {
				...application,
				data: {
					...application.data,
					fields: fields.filter(f => f.id !== action.payload.fieldId),
				},
			};

		case 'ADD_STRUCT': return addStructure( application, action.payload.name ) as Application
		case 'EDIT_STRUCT': return editStructure( application, action.payload.structId, action.payload.struct ) as Application
		case 'REMOVE_STRUCT': return removeStructure( application, action.payload.structId ) as Application



		case 'ADD_STRUCT_FIELD':
			return {
				...application,
				data: {
					...application.data,
					structures: structures.map(struct => {
						if (struct.id !== action.payload.structId) return struct;
						const properties = struct.properties ?? [];
						return {
							...struct,
							properties: [...properties, createDefaultField(action.payload.fieldName)]
						}
					})
				},
			};

		case 'EDIT_STRUCT_FIELD':
			return {
				...application,
				data: {
					...application.data,
					structures: structures.map(struct => {
						if (struct.id !== action.payload.structId) return struct;
						return {
							...struct,
							properties: struct.properties.map(field => {
								if (field.id !== action.payload.fieldId) return field;
								return action.payload.field;
							})
						}
					})
				},
			};

		case 'REMOVE_STRUCT_FIELD':
			return {
				...application,
				data: {
					...application.data,
					structures: structures.map(struct => {
						if (struct.id !== action.payload.structId) return struct;
						const properties = struct.properties ?? [];
						return {
							...struct,
							properties: properties.filter(f => f.id !== action.payload.fieldId)
						}
					})
				},
			};

		case 'ADD_MASK':
			return {
				...application,
				data: {
					...application.data,
					masks: [...masks, {
						id: generateRandomString(),
						name: action.payload.name,
						regex: "",
						substitution: ""
					}],
				},
			};

		case 'EDIT_MASK':
			return {
				...application,
				data: {
					...application.data,
					masks: masks
						.map(
							m => m.id === action.payload.maskId
								? action.payload.mask : m
						)
				},
			};

		case 'REMOVE_MASK':
			return {
				...application,
				data: {
					...application.data,
					masks: masks.filter(m => m.id !== action.payload.maskId),
				},
			};


		case 'ADD_MESSAGE':
			return {
				...application,
				data: {
					...application.data,
					messages: [...messages, {
						id: generateRandomString(),
						name: action.payload.name,
						content: ""
					}],
				},
			};

		case 'EDIT_MESSAGE':
			return {
				...application,
				data: {
					...application.data,
					messages: messages
						.map(
							m => m.id === action.payload.messageId
								? action.payload.message
								: m
						)
				},
			};

		case 'REMOVE_MESSAGE':
			return {
				...application,
				data: {
					...application.data,
					messages: messages.filter(m => m.id !== action.payload.messageId),
				},
			};



		case 'ADD_ENUMERATION':
			return {
				...application,
				data: {
					...application.data,
					enumerations: [...enumerations, {
						id: generateRandomString(),
						name: action.payload.name,
						values: [],
					}],
				},
			};

		case 'EDIT_ENUMERATION':
			return {
				...application,
				data: {
					...application.data,
					enumerations: enumerations
						.map(
							e => e.id === action.payload.enumId
								? action.payload.enumeration : e
						)
				},
			};

		case 'REMOVE_ENUMERATION': return removeEnumeration(application, action.payload.enumId) as Application;

		case 'ADD_ENUMERATION_VALUE':

			return {
				...application,
				data: {
					...application.data,
					enumerations: enumerations.map(e => {
						if (e.id !== action.payload.enumId) return e;
						return {
							...e,
							values: [...e.values, action.payload.value]
						}
					}),
				},
			};

		case 'REMOVE_ENUMERATION_VALUE':
			return {
				...application,
				data: {
					...application.data,
					enumerations: enumerations.map(e => {
						if (e.id !== action.payload.enumId) return e;
						return {
							...e,
							values: e.values.filter(v => v != action.payload.value)
						}
					}),
				},
			};

		case 'ADD_ORACLE':
			const payload = action.payload;
			return {
				...application,
				data: {
					...application.data,
					oracles: [...oracles, {
						id: generateRandomString(),
						name: payload.name,
						oracleHash: payload.oracleHash,
						service: payload.service,
						version: payload.version,
					}],
				},
			};

		case 'EDIT_ORACLE':
			return {
				...application,
				data: {
					...application.data,
					oracles: oracles
						.map(
							o => o.id === action.payload.oracleId
								? action.payload.oracle
								: o
						)
				},
			};

		case 'REMOVE_ORACLE':
			return {
				...application,
				data: {
					...application.data,
					oracles: oracles.filter(o => o.id !== action.payload.oracleId),
				},
			};


		default:
			throw 'Undefined case: '
	}
};

const applicationWithReducerAtom = atom(
	(get) => get(applicationAtom),
	(get, set, action: Action) => {
		const current = get(applicationAtom);
		set(applicationAtom, applicationReducer(current, action));
	}
);

export const useUpdateApplication = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	return (application : Application) => {
		console.log(application)
		dispatch({ type: 'UPDATE_APPLICATION', payload: { application } });
	};
}

export const useFieldEdition = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	const addField = (name: string) => {
		dispatch({ type: 'ADD_FIELD', payload: { name } });
	}
	const editField = (fieldId: string, field : AppDataField) => {
		dispatch({ type: 'EDIT_FIELD', payload: { fieldId, field: field } });
	};
	const removeField = (fieldId: string) => {
		dispatch({ type: 'REMOVE_FIELD', payload: { fieldId } });
	}
	return {addField, editField, removeField}
}

export const useMaskEdition = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	const add = (name: string) => {
		dispatch({ type: 'ADD_MASK', payload: { name } });
	}
	const edit = (maskId: string, mask: AppDataMask) => {
		dispatch({ type: 'EDIT_MASK', payload: { maskId, mask: mask } });
	};
	const remove = (maskId: string) => {
		dispatch({ type: 'REMOVE_MASK', payload: { maskId } });
	}
	return {add, edit, remove}
}

export const useApplicationOraclesEdition = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	const add = (name: string, oracleHash: string, service: string, version: number) => {
		dispatch({ type: 'ADD_ORACLE', payload: { name, oracleHash, service, version } });
	}
	const edit = (oracleId: string, oracle: AppDataOracle) => {
		dispatch({ type: 'EDIT_ORACLE', payload: { oracleId, oracle: oracle } });
	};
	const remove = (oracleId: string) => {
		dispatch({ type: 'REMOVE_ORACLE', payload: { oracleId } });
	}
	return {add, edit, remove}
}



export const useStructEdition = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);

	// structure edition
	const add = (name: string) => {
		dispatch({ type: 'ADD_STRUCT', payload: { name } });
	}
	const edit = (structId: string, struct: AppDataStruct) => {
		dispatch({ type: 'EDIT_STRUCT', payload: { structId, struct: struct } });
	};
	const remove = (structId: string) => {
		dispatch({ type: 'REMOVE_STRUCT', payload: { structId } });
	}


	// field in structure edition
	const addField = (structId: string, fieldName: string) => {
		dispatch({ type: 'ADD_STRUCT_FIELD', payload: { structId, fieldName } });
	}
	const editField = (structId: string, fieldId: string, field: AppDataField) => {
		dispatch({ type: 'EDIT_STRUCT_FIELD', payload: { structId, fieldId, field } });
	};
	const removeField = (structId: string, fieldId: string) => {
		dispatch({ type: 'REMOVE_STRUCT_FIELD', payload: { structId, fieldId } });
	}
	return {add, edit, remove, addField, editField, removeField}
}

export const useMessageEdition = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	const add = (name: string) => {
		dispatch({ type: 'ADD_MESSAGE', payload: { name } });
	}
	const edit = (messageId: string, message: AppDataMessage) => {
		dispatch({ type: 'EDIT_MESSAGE', payload: { messageId, message: message } });
	};
	const remove = (messageId: string) => {
		dispatch({ type: 'REMOVE_MESSAGE', payload: { messageId } });
	}
	return {add, edit, remove}
}

export const useEnumerationEdition = () => {
	const dispatch = useSetAtom(applicationWithReducerAtom);
	const add = (name: string) => {
		dispatch({ type: 'ADD_ENUMERATION', payload: { name } });
	}
	const edit = (enumId: string, enumeration: AppDataEnum) => {
		dispatch({ type: 'EDIT_ENUMERATION', payload: { enumId, enumeration: enumeration } });
	};
	const remove = (enumId: string) => {
		dispatch({ type: 'REMOVE_ENUMERATION', payload: { enumId } });
	}

	const addEnumValue = (enumId: string, value: string) => {
		dispatch({ type: 'ADD_ENUMERATION_VALUE', payload: { enumId, value } });
	}

	const removeEnumValue = (enumId: string, value: string) => {
		dispatch({ type: 'REMOVE_ENUMERATION_VALUE', payload: { enumId, value } });
	}
	return {add, edit, remove, addEnumValue, removeEnumValue}
}


export const useApplicationEditionStatus = () => {
	return useAtomValue(applicationIsModifiedAtom);
}

