import {
	ApplicationEditor,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import { useRef, useState } from 'react';
import { generateRandomString } from 'ts-randomstring/lib';
import { Button, Checkbox, Input, Option, Radio, Select, Typography } from '@material-tailwind/react';
import SmallCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/small-edition-card';
import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { useApplication, useUpdateApplication } from '@/contexts/application-store.context';
import { useSetEditionStatus } from '@/contexts/edition-status.context';
import ConditionallyHiddenLayout from '@/components/conditionally-hidden-layout.component';
import { AppDataField } from '@/entities/application.entity';
import { Field } from '@/components/api.hook';


type FieldVisility = 'public' | 'private';

export default function ApplicationFieldEditionCard(
	input: {
		field: AppDataField,
		onRemoveField: (fieldName: string) => void,
		structureName?: string
	},
) {
	const application = useApplication();
	const setApplication = useUpdateApplication();

	function refreshType(field: AppDataField) {
		setApplication(application => {
			const editor = new ApplicationEditor(application);

			if (input.structureName) {
				editor.updateFieldInStructure(input.structureName, field);
			} else {
				editor.updateField(field);
			}
		});
	}

	return <FieldEditionCard
		field={input.field}
		onRemoveField={input.onRemoveField}
		refreshType={refreshType}
		getStructures={() => application.data.structures}
		getEnumerations={() => application.data.enumerations}
		getMasks={() => application.data.masks}
	/>;
}


export function FieldEditionCard(
	input: {
		field: Field,
		onRemoveField: (fieldName: string) => void,
		structureName?: string,
		refreshType: (refreshedType: Field) => void
		getStructures: () => { name: string }[],
		getEnumerations: () => { name: string }[],
		getMasks: () => { name: string }[],
		disableMask?: boolean,
		defaultHashable?: boolean,
		defaultIsPublic?: boolean,
	},
) {
	const field = input.field;
	const setHasBeenModified = useSetEditionStatus();

	// define types that directly obtained from the field
	const [fieldName, setFieldName] = useState<string>(field.name);


	// from the field type is derived several properties defined below
	const fieldType = useRef(sdk.utils.data.extractType(field.type));
	const fieldMaskId = useRef(field.maskId ? field.maskId.toString() : undefined);
	const isList = useRef(sdk.utils.data.isArray(field.type));
	const isPublic = useRef(input.defaultIsPublic || sdk.utils.data.isPublic(field.type));
	const isRequired = useRef(sdk.utils.data.isRequired(field.type));
	const isHashable = useRef(input.defaultHashable || sdk.utils.data.isHashable(field.type));


	function updateFieldName(fieldName: string) {
		setHasBeenModified(true);
		setFieldName(fieldName);
		refreshType();
	}

	function updateType(type: string) {
		setHasBeenModified(true);
		console.log('assigning new type:', type);
		fieldType.current = parseInt(type);
		refreshType();
	}

	function updateMask(maskId: string | undefined) {
		setHasBeenModified(true);
		if (maskId) {
			fieldMaskId.current = maskId;
		} else {
			fieldMaskId.current = undefined;
		}
		refreshType();
	}

	function setIsList(value: boolean) {
		setHasBeenModified(true);
		isList.current = value;
		refreshType();
	}

	function setIsRequired(required: boolean) {
		setHasBeenModified(true);
		isRequired.current = required;
		refreshType();
	}


	function setVisibility(visibility: FieldVisility) {
		setHasBeenModified(true);
		isPublic.current = visibility === 'public';
		refreshType();
	}

	function setIsHashable(value: boolean) {
		setHasBeenModified(true);
		isHashable.current = value;
		refreshType();
	}


	function refreshType() {
		const field = {
			name: fieldName,
			type: sdk.utils.data.createType({
				public: isPublic.current,
				optional: !isRequired.current,
				hashable: isHashable.current,
				array: isList.current,
				type: fieldType.current,
				maskable: fieldMaskId.current !== undefined,
			}),
			maskId: fieldMaskId.current ? parseInt(fieldMaskId.current) : undefined,
		};

		input.refreshType(field);
	}


	// generate a random field id, used to isolate radio buttons
	const fieldFormId = generateRandomString({ length: 256 });

	// compute the list of types
	const availableTypes: { key: string, value: string, label: string }[] = [];
	Object.entries(sdk.constants.DATA.PrimitiveTypes).forEach(([k, v], index) => {
		availableTypes.push({
			key: `prim-${k}`,
			value: `${v}`,
			label: k,
		});
	});
	input.getStructures().forEach((structure, index) => {
		availableTypes.push({
			key: `struct-${index}`,
			value: (sdk.constants.DATA.STRUCT | index).toString(),
			label: structure.name,
		});
	});
	input.getEnumerations().forEach((enumeration, index) => {
		availableTypes.push({
			key: `enum-${index}`,
			value: (sdk.constants.DATA.ENUM | index).toString(),
			label: enumeration.name,
		});
	});


	// compute the list of masks
	const availableMasks = input.getMasks().map((mask, index) => ({
		key: `mask-${index}`,
		value: index.toString(),
		label: mask.name,
	}));

	return <SmallCardEdition name={field.name} onRemove={() => input.onRemoveField(field.name)}>
		<Input variant={'outlined'} size={'md'} label={'Name'} value={fieldName}
			   onChange={(e) => updateFieldName(e.target.value)} />

		<div className="flex flex-col gap-3">
			<Typography variant={'h6'} className={''}>Type</Typography>

			{/* Select the type of the field (among primitives, structures or enumerations ) */}
			<Select
				label="Type"
				name={fieldFormId}
				id={fieldFormId}
				value={fieldType.current.toString()}
				onChange={(value) => value && updateType(value)}
				menuProps={{
					className: 'max-h-48 overflow-auto',
				}}>

				{
					availableTypes.map((entry) =>
						<Option key={entry.key} value={entry.value}>{entry.label}</Option>,
					)
				}


			</Select>

			<div className="flex flex-wrap">
				<Checkbox label={'Array'} checked={isList.current} onChange={e => setIsList(e.target.checked)} />
				<Checkbox label={'Required'} checked={isRequired.current}
						  onChange={e => setIsRequired(e.target.checked)} />
				<ConditionallyHiddenLayout showOn={input.defaultHashable === undefined}>
					<Checkbox label={'Hashable'} checked={isHashable.current}
							  onChange={e => setIsHashable(e.target.checked)} />
				</ConditionallyHiddenLayout>
			</div>
		</div>

		<ConditionallyHiddenLayout showOn={input.defaultIsPublic === undefined}>
			<div className="visibility">
				<Typography variant={'h6'}>Visiblity</Typography>
				<Radio name={`visibility-${fieldFormId}`} label="public"
					   checked={sdk.utils.data.isPublic(field.type)}
					   onChange={() => setVisibility('public')} />
				<Radio name={`visibility-${fieldFormId}`} label="private"
					   checked={sdk.utils.data.isPrivate(field.type)}
					   onChange={() => setVisibility('private')} />
			</div>
		</ConditionallyHiddenLayout>


		{/* Select the mask if desired */}
		<ConditionallyHiddenLayout showOn={input.disableMask === undefined}>
			<div className="flex flex-row space-x-2">
				<Select
					label="Mask"
					disabled={!sdk.utils.data.isPrimitive(field.type)}
					value={fieldMaskId.current}
					onChange={updateMask}
					menuProps={{
						className: 'max-h-48 overflow-auto',
					}}>

					{
						availableMasks.map((entry, index) =>
							<Option key={entry.key} value={entry.value}>{entry.label}</Option>,
						)
					}


				</Select>

				<Button
					onClick={() => updateMask(undefined)}
					aria-label="Clear selection"
					hidden={fieldMaskId.current === undefined}
				>
					<i className="bi bi-trash" />
				</Button>
			</div>

		</ConditionallyHiddenLayout>

	</SmallCardEdition>
		;

}
