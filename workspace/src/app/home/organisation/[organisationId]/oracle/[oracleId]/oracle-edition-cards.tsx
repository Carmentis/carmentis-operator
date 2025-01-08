import { useEffect, useState } from 'react';
import { generateRandomString } from 'ts-randomstring/lib';
import {
	Card,
	CardBody,
	CardHeader,
	Checkbox,
	IconButton,
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import { OracleServiceInputField, OracleServiceOutputField, OracleStructureField } from '@/components/api.hook';
import { useOracle, useSetOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';
import {
	FieldVisility,
	PrimitiveType,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';


export default function OracleServiceFieldEditionCard(
	input: {
		fieldType: 'input' | 'output'
		serviceId?: number,
		structureId?: number
		field: OracleServiceInputField | OracleServiceOutputField | OracleStructureField
		onRemoveField: (fieldId: string) => void,
	},
) {
	const oracle = useOracle();
	const setOracle = useSetOracle();
	const field = input.field;
	const [fieldName, setFieldName] = useState<string>(field.name);
	const [fieldType, setFieldType] = useState<string>(field.type);
	const [isList, setIsList] = useState(field.isList);
	const [isRequired, setIsRequired] = useState(field.isRequired);
	const [isHashable, setIsHashable] = useState('isHashable' in input.field ? input.field.isHashable : false);
	const [availableMasks, setAvailableMasks] = useState<string[]>(oracle.data.masks.map(m => m.name));
	const [availableStructures, setAvailableStructures] = useState<string[]>(
		oracle.data.structures.map(s => s.name)
	);


	useEffect(() => {

		setOracle(editor => {
			if ( input.fieldType === 'input' && input.serviceId ) {
				editor.updateServiceInput(input.serviceId, field);
			}
		})
	}, [fieldName, fieldType, isList]);

	function updateFieldName(fieldName: string) {

	}

	function updateType(type: string) {

	}

	function updateIsList(value: boolean) {
		setOracle(editor => {

		})
	}

	function updateRequired(value: boolean) {
	}

	function updateHashable(value: boolean) {
	}

	function updateVisibility(visibility: FieldVisility) {
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

					<Checkbox label={'Array'} checked={isList} onChange={e => updateIsList(e.target.checked)} />
					{	input.fieldType !== 'input' &&
						<Checkbox label={'Required'} checked={isRequired} onChange={e => updateRequired(e.target.checked)} />
					}
					{	input.fieldType !== 'input' &&
						<Checkbox label={'Hashable'} checked={isHashable} onChange={e => updateHashable(e.target.checked)} />
					}
				</div>
			</div>



		</CardBody>
	</Card>;
}
