import {
	ApplicationEditor,
	AppDataField, FieldVisility, PrimitiveType,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import { useEffect, useState } from 'react';
import { generateRandomString } from 'ts-randomstring/lib';
import {
	Card,
	CardBody,
	CardHeader,
	Checkbox,
	IconButton,
	Input,
	Option, Radio,
	Select,
	Typography,
} from '@material-tailwind/react';
import {
	useUpdateApplication,
	useSetEditionStatus, useApplication, useApplicationStrutures,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';

export default function FieldEditionCard(
	input: {
		field: AppDataField,
		onRemoveField: (fieldName: string) => void,
		structureName?: string
	},
) {
	const field = input.field;

	const application = useApplication();
	const setApplication = useUpdateApplication();
	const setHasBeenModified = useSetEditionStatus();
	const [fieldName, setFieldName] = useState<string>(field.name);
	const [fieldType, setFieldType] = useState<string>(field.type);
	const [hashable, setHashable] = useState<boolean>(field.hashable);
	const [required, setRequired] = useState<boolean>(field.required);
	const [isArray, setIsArray] = useState(false);
	const [visibility, setVisibility] = useState<FieldVisility>(field.visiblity);
	const [availableStructures, setAvailableStructures] = useState<string[]>(
		application.data.structures.map(s => s.name)
	);

	useEffect(() => {
		setAvailableStructures(application.data.structures.map(s => s.name))
	}, [application]);


	useEffect(() => {
		const field: AppDataField = {
			hashable: hashable,
			isArray: isArray,
			name: fieldName,
			required: required,
			type: fieldType,
			visiblity: visibility
		};

		setApplication(application => {
			const editor = new ApplicationEditor(application);

			if ( input.structureName ) {
				editor.updateFieldInStructure(input.structureName, field);
			} else {
				editor.updateField(field)
			}
		})
	}, [fieldName, fieldType, hashable, visibility, required, isArray]);

	function updateFieldName(fieldName: string) {
		setHasBeenModified(true);
		setFieldName(fieldName);
	}

	function updateType(type: string) {
		setHasBeenModified(true);
		setFieldType(type);
	}

	function updateIsArray(value: boolean) {
		setHasBeenModified(true);
		setIsArray(value);
	}

	function updateRequired(value: boolean) {
		setHasBeenModified(true);
		setRequired(value);
	}

	function updateHashable(value: boolean) {
		setHasBeenModified(true);
		setHashable(value);
	}

	function updateVisibility(visibility: FieldVisility) {
		setHasBeenModified(true);
		setVisibility(visibility);
	}

	// generate a random field id, used to isolate radio buttons
	const fieldFormId = generateRandomString({ length: 256 });

	// compute the list of types
	const availableTypes: { key: string, value: string, label: string }[] = [];
	Object.values(PrimitiveType).forEach((type, index) => {
		availableTypes.push({
			key: `prim-${index}`,
			value: type,
			label: type,
		});
	});
	availableStructures.forEach((type, index) => {
		availableTypes.push({
			key: `struct-${index}`,
			value: type,
			label: type,
		});
	});


	return <Card className={' w-72 shadow-lg'}>
		<CardHeader floated={false}
					shadow={false}
					color="transparent"
					className="m-0 rounded-none rounded-t-md bg-gray-800 p-2 flex justify-between items-center">

			<Typography variant={'h6'} color={'white'}>{field.name}</Typography>

			{/* Icons */}
			<div id="icons" className={'flex gap-2'}>
				<IconButton variant={'filled'} color={'white'} size={'sm'} onClick={() => input.onRemoveField(field.name)}>
					<i className="bi bi-trash" />
				</IconButton>
			</div>
		</CardHeader>
		<CardBody className={'flex flex-col space-y-3'}>
			<Input variant={'outlined'} size={'md'} label={'Name'} value={fieldName}
				   onChange={(e) => updateFieldName(e.target.value)} />

			<div className="flex flex-col gap-3">
				<Typography variant={'h6'} className={''}>Type</Typography>

				{/* Select the type of the field (among primitive of structure) */}
				<Select
					label="Type"
					name={fieldFormId}
					id={fieldFormId}
					value={fieldType}
					onChange={updateType}
					menuProps={{
						className: 'max-h-48 overflow-auto', // Limite la hauteur et ajoute un scroll
					}}>

					{
						availableTypes.map((entry) =>
							<Option key={entry.key} value={entry.value}>{entry.label}</Option>,
						)
					}


				</Select>

				<div className="flex flex-wrap">

					<Checkbox label={'Array'} checked={isArray} onChange={e => updateIsArray(e.target.checked)} />
					<Checkbox label={'Hashable'} checked={hashable} onChange={e => updateHashable(e.target.checked)} />
					<Checkbox label={'Required'} checked={required} onChange={e => updateRequired(e.target.checked)} />
				</div>
			</div>


			<div className="visibility">
				<Typography variant={'h6'}>Visiblity</Typography>
				<Radio name={`visibility-${fieldFormId}`} label="public" defaultChecked
					   checked={visibility === FieldVisility.public}
					   onChange={() => updateVisibility(FieldVisility.public)} />
				<Radio name={`visibility-${fieldFormId}`} label="private"
					   checked={visibility === FieldVisility.private}
					   onChange={() => updateVisibility(FieldVisility.private)} />
			</div>
		</CardBody>
	</Card>;
}
