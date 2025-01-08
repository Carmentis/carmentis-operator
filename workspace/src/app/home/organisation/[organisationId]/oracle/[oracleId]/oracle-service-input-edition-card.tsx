import { OracleServiceInputField } from '@/components/api.hook';
import { useOracle, useSetOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';
import { useEffect, useState } from 'react';
import { PrimitiveType } from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {
	Checkbox,
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import SmallCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/small-edition-card';

export function OracleServiceInputFieldEditionCard(
	input: {
		serviceId: number,
		field: OracleServiceInputField,
		onRemoveField: () => void
	},
) {
	const serviceId = input.serviceId;
	const oracle = useOracle();
	const setOracle = useSetOracle();
	const field = input.field;
	const [fieldName, setFieldName] = useState<string>(field.name);
	const [fieldType, setFieldType] = useState<string>(field.type);
	const [isList, setIsList] = useState(field.isList);
	const [availableStructures, setAvailableStructures] = useState<string[]>(
		oracle.data.structures.map(s => s.name),
	);

	useEffect(() => {
		setAvailableStructures(oracle.data.structures.map(s => s.name));
	}, [oracle]);

	useEffect(() => {
		setOracle(editor => editor.updateServiceInput(input.serviceId, field));
	}, [fieldName, fieldType, isList]);

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

	return <SmallCardEdition
		name={field.name}
		onRemove={() => input.onRemoveField()}>

		<Input variant={'outlined'} size={'md'} label={'Name'} value={fieldName}
			   onChange={(event) => {
				   const name = event.target.value;
				   setFieldName(name);
				   setOracle(e => e.updateServiceInput(
					   serviceId,
					   { ...field, name },
				   ));
			   }} />

		<div className="flex flex-col gap-3">
			<Typography variant={'h6'} className={''}>Type</Typography>

			{/* Select the type of the field (among primitives or structures) */}
			<Select
				label="Type"
				value={fieldType}
				menuProps={{ className: 'max-h-48 overflow-auto' }}
				onChange={event => {
					if (!event) return;
					setFieldType(event);
					setOracle(e => e.updateServiceInput(
						serviceId,
						{ ...field, type: event },
					));
				}}>

				{
					availableTypes.map((entry) =>
						<Option key={entry.key} value={entry.value}>{entry.label}</Option>,
					)
				}
			</Select>

			<div className="flex flex-wrap">
				<Checkbox label={'Array'} checked={isList} onChange={event => {
					const checked = event.target.checked;
					setIsList(checked);
					setOracle(e => e.updateServiceInput(
						serviceId,
						{ ...field, isList: checked },
					));
				}} />
			</div>
		</div>
	</SmallCardEdition>;

}
