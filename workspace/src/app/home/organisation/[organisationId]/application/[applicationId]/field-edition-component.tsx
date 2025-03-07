import { useEffect, useState } from 'react';
import { IconButton, MenuItem } from '@material-tailwind/react';
import { Checkbox, Select, TableCell, TableRow, TextField } from '@mui/material';
import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { AppDataField } from '@/entities/application.entity';
import { useAtomValue } from 'jotai';
import {
	applicationAtom,
	applicationEnumerationsAtom,
	applicationMasksAtom, applicationOraclesAtom,
	applicationStructuresAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useFieldEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import {
	oracleEnumerationAtom, oracleMasksAtom,
	oracleStructureAtom,
} from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';


export default function ApplicationFieldEditionCard(
	input: {
		field: AppDataField,
		onRemoveField: (fieldId: string) => void,
		structureName?: string
	},
) {

	const fieldEdition = useFieldEdition();

	return <FieldEditionComponent
		field={input.field}
		onRemoveField={input.onRemoveField}
		onUpdateField={field => fieldEdition.editField(input.field.id, field)}
	/>;
}



export function FieldEditionComponent(
	input: {
		field: AppDataField,
		onUpdateField: (field: AppDataField) => void,
		onRemoveField: (fieldId: string) => void,
		structureName?: string,
		disableMask?: boolean,
		defaultHashable?: boolean,
		defaultIsPublic?: boolean,
	},
) {
	const field = input.field;

	const [fieldName, setFieldName] = useState(field.name);
	const [fieldKind, setFieldKind] = useState(field.kind);
	const [fieldType, setFieldType] = useState(field.type?.id);

	const mask = field.kind === 'primitive' && field.type && field.type.mask ? field.type.mask : '';
	const [fieldMask, setFieldMask] = useState<string>(mask);
	const [isList, setIsList] = useState(field.array);

	const visibility = field.kind === 'primitive' ? field.type.private : false;
	const [isPublic, setIsPublic] = useState(input.defaultIsPublic || !visibility);
	const [isRequired, setIsRequired] = useState(field.required);

	const hashable = field.kind === 'primitive' ? field.type.hashable : false;
	const [isHashable, setIsHashable] = useState(input.defaultHashable || hashable);

	// load structures, enumeration, masks and oracle answers
	const application = useAtomValue(applicationAtom);
	const structures = useAtomValue(application ? applicationStructuresAtom : oracleStructureAtom);
	const enumerations = useAtomValue(application ? applicationEnumerationsAtom : oracleEnumerationAtom);
	const masks = useAtomValue(application ? applicationMasksAtom : oracleMasksAtom);
	const oracleAnswers = useAtomValue(applicationOraclesAtom);


	useEffect(() => {
		const f: AppDataField = {
			...field,
			name: fieldName,
			array: isList,
			required: isRequired,
		}

		input.onUpdateField(f);

	}, [fieldName, fieldType, isList, isRequired]);

	useEffect(() => {
		if (field.kind === 'primitive') {
			const f: AppDataField = {
				...field,
				name: fieldName,
				array: isList,
				required: isRequired,
				kind: 'primitive',
				type: {
					...field.type,
					private: !isPublic
				}
			}

			input.onUpdateField(f);

		} else {
			console.warn(`I have received an update for fieldMask or isHashable but is kind ${field.kind}`)
		}
	}, [isPublic]);


	// update the field when mask or hashable are updated
	useEffect(() => {
		if (field.kind !== 'primitive') {
			console.warn(`I have received an update for fieldMask or isHashable but is kind ${field.kind}`)
			return
		}

		input.onUpdateField({
			...field,
			type: {
				...field.type,
				hashable: isHashable,
				mask: fieldMask,
			}
		})
	}, [fieldMask, isHashable]);

	useEffect(() => {
		const f : AppDataField = {
			...field,
			kind: fieldKind,
			type: undefined,
		};
		if (fieldKind === 'primitive') {
			f.type = {
				hashable: isHashable,
				mask: fieldMask,
				private: !isPublic,
				id: fieldType
			}
		} else if (fieldKind === 'enumeration') {
			const firstEnumerationId = enumerations.length !== 0 ? enumerations[0].id : undefined;
			f.type = {
				id: firstEnumerationId
			}
		} else if (fieldKind === 'structure') {
			const firstStructureId = structures.length !== 0 ? structures[0].id : undefined;
			f.type = {
				id: firstStructureId
			}
		} else if (fieldKind === 'oracleAnswer') {
			const firstOracleAnswerId = oracleAnswers.length !== 0 ? oracleAnswers[0].id : undefined;
			f.type = {
				id: firstOracleAnswerId
			}
		}

		input.onUpdateField(f);
	}, [fieldKind]);

	useEffect(() => {
		const f : AppDataField = {
			...field,
			kind: fieldKind,
			type: undefined,
		};
		if (fieldKind === 'primitive') {
			f.type = {
				hashable: isHashable,
				mask: fieldMask,
				private: !isPublic,
				id: fieldType
			}
		} else {
			f.type = {
				id: fieldType
			}
		}

		input.onUpdateField(f);
	}, [fieldType]);


	function getTypesFromKind(kind: string): { label: string; value: string }[] {
		switch (kind) {
			case 'primitive': return Object.keys(sdk.constants.DATA.PrimitiveTypes)
				.map(k => {
					return {label: k, value: k}
				})
			case 'enumeration': return enumerations.map(e => {
				return {label: e.id, value: e.name}
			})
			case 'structure': return structures.map(e => {
				return {label: e.id, value: e.name}
			})
			case 'oracleAnswer': return oracleAnswers.map(o => {
				return { label: o.id, value: o.name }
			})
			case 'undefined': return []
			default: console.error(`Undefined kind of property: ${kind}`)
		}
	}
	const types = getTypesFromKind(fieldKind);

	const noTypes = types.length === 0;
	const showListField = !noTypes && fieldKind !== 'undefined'
	const showRequiredField = !noTypes && fieldKind !== 'undefined'
	const showPublicField = !noTypes && fieldKind === 'primitive'
	const showHashableField = !noTypes && fieldKind === 'primitive'
	const showMaskField =  !input.disableMask && masks.length !== 0 && fieldKind === 'primitive'
	const showType = fieldKind !== 'undefined' && types.length !== 0;

	return <TableRow>
		<TableCell>
			<TextField variant={'outlined'} size={'small'}  value={fieldName}
					   fullWidth
				   onChange={(e) => setFieldName(e.target.value)} />
		</TableCell>
		<TableCell>
			<Select
				native={true}
				fullWidth
				value={fieldKind}
				onChange={e => setFieldKind(e.target.value)}
				size={"small"} variant={"outlined"}>
				<option value={"primitive"}>Primitive</option>
				<option value={"structure"}>Structure</option>
				<option value={"enumeration"}>Enumeration</option>
				<option value={"oracleAnswer"}>Oracle answer</option>
				<option value={"undefined"}>Undefined</option>
			</Select>
		</TableCell>
		<TableCell>
			{
				showType &&
				<Select
					native={true}
					disabled={types.length === 0}
					fullWidth
					value={fieldType}
					onChange={(e) => {
						console.log("Setting to", e.target.value)
						setFieldType(e.target.value)
					}}
					size={"small"} variant={"outlined"}>

					{
						types.map((t, index) =>
							<option key={index} value={t.label}>{t.value}</option>
						)
					}

				</Select>
			}
		</TableCell>
		<TableCell>
			{
				showListField &&
				<Checkbox
					checked={isList}
					onChange={e => setIsList(e.target.checked)} />
			}

		</TableCell>
		<TableCell>
			{
				showRequiredField &&
				<Checkbox checked={isRequired}
						  onChange={e => setIsRequired(e.target.checked)} />
			}
		</TableCell>
		<TableCell hidden={input.defaultIsPublic !== undefined}>
			{
				showPublicField &&
				<Checkbox checked={isPublic}
						  disabled={input.defaultIsPublic !== undefined}
						  onChange={e => setIsPublic(e.target.checked)} />
			}
		</TableCell>
		<TableCell hidden={input.defaultHashable !== undefined}>
			{
				showHashableField &&
				<Checkbox checked={isHashable}
						  onChange={e => setIsHashable(e.target.checked)} />
			}
		</TableCell>
		<TableCell>
			{
				showMaskField &&
				<Select
					native={true}
					size={"small"}
					fullWidth={true}
					hidden={fieldKind !== 'primitive'}
					value={fieldMask || ''}
					onChange={e => setFieldMask(e.target.value)}
				>
					<option value={""}></option>
					{
						masks.map((mask, index) =>
							<option key={index} value={mask.id}>{mask.name}</option>
						)
					}
				</Select>
			}
		</TableCell>
		<TableCell>
			<div className={"flex gap-2"}>
				<IconButton variant={'filled'} className={"bg-white"} size={'sm'} onClick={() => input.onRemoveField(field.id)}>
					<i className="bi bi-trash text-black" />
				</IconButton>
				<IconButton variant={'filled'} className={"cursor-default bg-yellow-100"} size={'sm'} hidden={fieldKind !== 'undefined' && types.length !== 0}>
					<i className="bi bi-exclamation-triangle text-black" />
				</IconButton>
			</div>

		</TableCell>
	</TableRow>

}
