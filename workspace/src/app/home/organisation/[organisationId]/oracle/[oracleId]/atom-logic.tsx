import { AppDataField, AppDataMask, AppDataStruct } from '@/entities/application.entity';
import { atom } from 'jotai/index';
import { applicationIsModifiedAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useAtomValue, useSetAtom } from 'jotai';
import { generateRandomString } from 'ts-randomstring/lib';
import { Oracle, OracleDataEnum, OracleDataMask, OracleDataService } from '@/entities/oracle.entity';
import { oracleAtom } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';
import {
	addStructure,
	createDefaultField, editStructure, removeEnumeration, removeStructure,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';

type Action =

	| { type: 'UPDATE_ORACLE'; payload: { oracle: Oracle } }

	| { type: 'ADD_SERVICE'; payload: { name: string } }
	| { type: 'EDIT_SERVICE'; payload: { serviceId: string, service: OracleDataService } }
	| { type: 'REMOVE_SERVICE'; payload: { serviceId: string } }

	| { type: 'ADD_SERVICE_INPUT'; payload: { serviceId: string, name: string } }
	| { type: 'EDIT_SERVICE_INPUT'; payload: { serviceId: string, fieldId: string, field: AppDataField } }
	| { type: 'REMOVE_SERVICE_INPUT'; payload: { serviceId: string, fieldId: string } }

	| { type: 'ADD_SERVICE_OUTPUT'; payload: { serviceId: string, name: string } }
	| { type: 'EDIT_SERVICE_OUTPUT'; payload: { serviceId: string, fieldId: string, field: AppDataField } }
	| { type: 'REMOVE_SERVICE_OUTPUT'; payload: { serviceId: string, fieldId: string } }

	| { type: 'ADD_MASK'; payload: { name: string } }
	| { type: 'EDIT_MASK'; payload: { maskId: string, mask: OracleDataMask } }
	| { type: 'REMOVE_MASK'; payload: { maskId: string } }

	| { type: 'ADD_ENUMERATION'; payload: { name: string } }
	| { type: 'EDIT_ENUMERATION'; payload: { enumId: string, enumeration: OracleDataEnum } }
	| { type: 'REMOVE_ENUMERATION'; payload: { enumId: string } }
	| { type: 'ADD_ENUMERATION_VALUE'; payload: { enumId: string, value: string } }
	| { type: 'REMOVE_ENUMERATION_VALUE'; payload: { enumId: string, value: string } }

	| { type: 'ADD_STRUCT'; payload: { name: string } }
	| { type: 'EDIT_STRUCT'; payload: { structId: string, struct: AppDataStruct } }
	| { type: 'REMOVE_STRUCT'; payload: { structId: string } }
	| { type: 'ADD_STRUCT_FIELD'; payload: { structId: string, fieldName: string } }
	| { type: 'EDIT_STRUCT_FIELD'; payload: { structId: string, fieldId: string, field: AppDataField } }
	| { type: 'REMOVE_STRUCT_FIELD'; payload: { structId: string, fieldId: string } }
	;


function createDefaultService(name: string) : OracleDataService{
	return {
		id: generateRandomString(),
		answer: [],
		name,
		request: []
	}
}

const oracleReducer = (oracle: Oracle | undefined, action: Action): Oracle | undefined => {
	if (!oracle) return oracle;

	// prevent empty data
	const services = oracle.data.services ?? [];
	const structures = oracle.data.structures ?? []
	const masks = oracle.data.masks ?? [];
	const enumerations = oracle.data.enumerations ?? [];

	switch (action.type) {
		case 'UPDATE_ORACLE':
			return action.payload.oracle

		case 'ADD_STRUCT': return addStructure(oracle, action.payload.name) as Oracle;
		case 'EDIT_STRUCT': return editStructure(oracle, action.payload.structId, action.payload.struct) as Oracle;
		case 'REMOVE_STRUCT': return removeStructure(oracle, action.payload.structId) as Oracle;


		case 'ADD_STRUCT_FIELD':
			return {
				...oracle,
				data: {
					...oracle.data,
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
				...oracle,
				data: {
					...oracle.data,
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
				...oracle,
				data: {
					...oracle.data,
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
				...oracle,
				data: {
					...oracle.data,
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
				...oracle,
				data: {
					...oracle.data,
					masks: masks
						.map(
							m => m.id === action.payload.maskId
								? action.payload.mask : m
						)
				},
			};

		case 'REMOVE_MASK':
			return {
				...oracle,
				data: {
					...oracle.data,
					masks: masks.filter(m => m.id !== action.payload.maskId),
				},
			};

		case 'ADD_ENUMERATION':
			return {
				...oracle,
				data: {
					...oracle.data,
					enumerations: [...enumerations, {
						id: generateRandomString(),
						name: action.payload.name,
						values: [],
					}],
				},
			};

		case 'EDIT_ENUMERATION':
			return {
				...oracle,
				data: {
					...oracle.data,
					enumerations: enumerations
						.map(
							e => e.id === action.payload.enumId
								? action.payload.enumeration : e
						)
				},
			};

		case 'REMOVE_ENUMERATION': return removeEnumeration(oracle, action.payload.enumId) as Oracle

		case 'ADD_ENUMERATION_VALUE':

			return {
				...oracle,
				data: {
					...oracle.data,
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
				...oracle,
				data: {
					...oracle.data,
					enumerations: enumerations.map(e => {
						if (e.id !== action.payload.enumId) return e;
						return {
							...e,
							values: e.values.filter(v => v != action.payload.value)
						}
					}),
				},
			};



		case 'ADD_SERVICE':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: [...services, createDefaultService(action.payload.name)],
				},
			};

		case 'EDIT_SERVICE':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services
						.map(
							s => s.id === action.payload.serviceId ? action.payload.service : s
						)
				},
			};

		case 'REMOVE_SERVICE':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.filter(s => s.id !== action.payload.serviceId),
				},
			};



		case 'ADD_SERVICE_INPUT':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.map(service => {
						if (service.id !== action.payload.serviceId) return service;
						const properties = service.request ?? [];
						return {
							...service,
							request: [...properties, createDefaultField(action.payload.name)]
						}
					})
				},
			};

		case 'EDIT_SERVICE_INPUT':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.map(service => {
						if (service.id !== action.payload.serviceId) return service;
						return {
							...service,
							request: service.request.map(field => {
								if (field.id !== action.payload.fieldId) return field;
								return action.payload.field;
							})
						}
					})
				},
			};

		case 'REMOVE_SERVICE_INPUT':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.map(service => {
						if (service.id !== action.payload.serviceId) return service;
						const properties = service.request ?? [];
						return {
							...service,
							request: properties.filter(f => f.id !== action.payload.fieldId)
						}
					})
				},
			};

		case 'ADD_SERVICE_OUTPUT':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.map(service => {
						if (service.id !== action.payload.serviceId) return service;
						const properties = service.answer ?? [];
						return {
							...service,
							answer: [...properties, createDefaultField(action.payload.name)]
						}
					})
				},
			};

		case 'EDIT_SERVICE_OUTPUT':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.map(service => {
						if (service.id !== action.payload.serviceId) return service;
						return {
							...service,
							answer: service.answer.map(field => {
								if (field.id !== action.payload.fieldId) return field;
								return action.payload.field;
							})
						}
					})
				},
			};

		case 'REMOVE_SERVICE_OUTPUT':
			return {
				...oracle,
				data: {
					...oracle.data,
					services: services.map(service => {
						if (service.id !== action.payload.serviceId) return service;
						const properties = service.answer ?? [];
						return {
							...service,
							answer: properties.filter(f => f.id !== action.payload.fieldId)
						}
					})
				},
			};





	}
};

const oracleWithReducerAtom = atom(
	(get) => get(oracleAtom),
	(get, set, action: Action) => {
		const current = get(oracleAtom);
		set(oracleAtom, oracleReducer(current, action));
	}
);

export const useUpdateOracle = () => {
	const dispatch = useSetAtom(oracleWithReducerAtom);
	return (oracle : Oracle) => {
		dispatch({ type: 'UPDATE_ORACLE', payload: { oracle } });
	};
}

export const useMaskEdition = () => {
	const dispatch = useSetAtom(oracleWithReducerAtom);
	const addMask = (name: string) => {
		dispatch({ type: 'ADD_MASK', payload: { name } });
	}
	const editMask = (maskId: string, mask: AppDataMask) => {
		dispatch({ type: 'EDIT_MASK', payload: { maskId, mask: mask } });
	};
	const removeMask = (maskId: string) => {
		dispatch({ type: 'REMOVE_MASK', payload: { maskId } });
	}
	return {addMask, editMask, removeMask}
}


export const useStructEdition = () => {
	const dispatch = useSetAtom(oracleWithReducerAtom);

	// structure edition
	const addStruct = (name: string) => {
		dispatch({ type: 'ADD_STRUCT', payload: { name } });
	}
	const editStruct = (structId: string, struct: AppDataStruct) => {
		dispatch({ type: 'EDIT_STRUCT', payload: { structId, struct: struct } });
	};
	const removeStruct = (structId: string) => {
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
	return {addStruct, editStruct, removeStruct, addField, editField, removeField}
}


export const useEnumerationEdition = () => {
	const dispatch = useSetAtom(oracleWithReducerAtom);
	const addEnum = (name: string) => {
		dispatch({ type: 'ADD_ENUMERATION', payload: { name } });
	}
	const editEnum = (enumId: string, enumeration: OracleDataEnum) => {
		dispatch({ type: 'EDIT_ENUMERATION', payload: { enumId, enumeration: enumeration } });
	};
	const removeEnum = (enumId: string) => {
		dispatch({ type: 'REMOVE_ENUMERATION', payload: { enumId } });
	}

	const addEnumValue = (enumId: string, value: string) => {
		dispatch({ type: 'ADD_ENUMERATION_VALUE', payload: { enumId, value } });
	}

	const removeEnumValue = (enumId: string, value: string) => {
		dispatch({ type: 'REMOVE_ENUMERATION_VALUE', payload: { enumId, value } });
	}
	return {addEnum, editEnum, removeEnum, addEnumValue, removeEnumValue}
}


export const useServiceEdition = () => {
	const dispatch = useSetAtom(oracleWithReducerAtom);

	// service edition
	const add = (name: string) => {
		dispatch({ type: 'ADD_SERVICE', payload: { name } });
	}
	const edit = (serviceId: string, service: OracleDataService) => {
		dispatch({ type: 'EDIT_SERVICE', payload: { serviceId, service } });
	};
	const remove = (serviceId: string) => {
		dispatch({ type: 'REMOVE_SERVICE', payload: { serviceId } });
	}


	// service's inputs edition
	const addInput = (serviceId: string, fieldName: string) => {
		dispatch({ type: 'ADD_SERVICE_INPUT', payload: { serviceId, name: fieldName } });
	}
	const editInput = (serviceId: string, fieldId: string, field: AppDataField) => {
		dispatch({ type: 'EDIT_SERVICE_INPUT', payload: { serviceId, fieldId, field } });
	};
	const removeInput = (serviceId: string, fieldId: string) => {
		dispatch({ type: 'REMOVE_SERVICE_INPUT', payload: { serviceId, fieldId } });
	}

	// service's outputs edition
	const addOutput = (serviceId: string, fieldName: string) => {
		dispatch({ type: 'ADD_SERVICE_OUTPUT', payload: { serviceId, name: fieldName } });
	}
	const editOutput = (serviceId: string, fieldId: string, field: AppDataField) => {
		dispatch({ type: 'EDIT_SERVICE_OUTPUT', payload: { serviceId, fieldId, field } });
	};
	const removeOutput = (serviceId: string, fieldId: string) => {
		dispatch({ type: 'REMOVE_SERVICE_OUTPUT', payload: { serviceId, fieldId } });
	}

	return {add, edit, remove, addInput, editInput, removeInput, addOutput, editOutput, removeOutput}
}

export const useApplicationEditionStatus = () => {
	return useAtomValue(applicationIsModifiedAtom);
}

