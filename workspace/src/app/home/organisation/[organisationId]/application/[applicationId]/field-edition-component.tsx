import { useEffect, useState } from 'react';
import { IconButton, MenuItem } from '@material-tailwind/react';
import { Checkbox, Select, TableCell, TableRow, TextField } from '@mui/material';
import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { AppDataField } from '@/entities/application.entity';
import { useAtomValue } from 'jotai';
import {
	applicationEnumerationsAtom,
	applicationMasksAtom, applicationOraclesAtom,
	applicationStructuresAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useFieldEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';


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
	const [fieldType, setFieldType] = useState(field.primitiveType?.type || field.structureType?.structureId || field.enumerationType?.enumerationId || field.oracleAnswerType?.oracleId);
	const [fieldMask, setFieldMask] = useState<string|undefined>(field.primitiveType?.mask || undefined);
	const [isList, setIsList] = useState(field.array);
	const [isPublic, setIsPublic] = useState(input.defaultIsPublic || !field.primitiveType?.private);
	const [isRequired, setIsRequired] = useState(field.required);
	const [isHashable, setIsHashable] = useState(input.defaultHashable || field.primitiveType?.hashable || false);

	const structures = useAtomValue(applicationStructuresAtom);
	const enumerations = useAtomValue(applicationEnumerationsAtom);
	const masks = useAtomValue(applicationMasksAtom);
	const oracleAnswers = useAtomValue(applicationOraclesAtom);


	console.log("mask:", fieldMask)
	useEffect(() => {
		//if (fieldType === undefined) throw 'The field type is required';


		const f: AppDataField = {
			...field,
			id: input.field.id,
			name: fieldName,
			array: isList,
			required: isRequired,
			kind: fieldKind,
		}

		input.onUpdateField(f);

	}, [fieldName, fieldMask, fieldType, isList, isPublic, isRequired, isHashable]);

	useEffect(() => {
		const f : AppDataField = {
			...field,
			kind: fieldKind,
			primitiveType: undefined,
			structureType: undefined,
			enumerationType: undefined,
			oracleAnswerType: undefined,
		};
		if (fieldKind === 'primitive') {
			f.primitiveType = {
				hashable: isHashable,
				mask: fieldMask,
				private: !isPublic,
				type: fieldType
			}
		} else if (fieldKind === 'enumeration') {
			const firstEnumerationId = enumerations.length !== 0 ? enumerations[0].id : undefined;
			f.enumerationType = {
				enumerationId: firstEnumerationId
			}
		} else if (fieldKind === 'structure') {
			const firstStructureId = structures.length !== 0 ? structures[0].id : undefined;
			f.structureType = {
				structureId: firstStructureId
			}
		} else if (fieldKind === 'oracleAnswer') {
			const firstOracleAnswerId = oracleAnswers.length !== 0 ? oracleAnswers[0].id : undefined;
			f.oracleAnswerType = {
				oracleId: firstOracleAnswerId
			}
		}

		console.log("on update kind of field:", f)
		input.onUpdateField(f);
	}, [fieldKind]);


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
			case 'oracleAnswer': return []
			case 'undefined': return []
			default: throw `Undefined kind of property: ${kind}`
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
