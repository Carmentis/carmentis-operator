import { OracleServiceOutputField } from '@/components/api.hook';
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

export function OracleServiceOutputFieldEditionCard(
	input: {
		serviceId: number,
		field: OracleServiceOutputField,
		onRemoveField: () => void
	}
) {
	const serviceId = input.serviceId;
	const oracle = useOracle();
	const setOracle = useSetOracle();
	const field = input.field;
	const [fieldName, setFieldName] = useState<string>(field.name);
	const [fieldType, setFieldType] = useState<string>(field.type);
	const [fieldMask, setFieldMask] = useState<string|undefined>(field.mask);
	const [isList, setIsList] = useState(field.isList);
	const [isRequired, setIsRequired] = useState(field.isRequired);
	const [isHashable, setIsHashable] = useState(field.isHashable);
	const [availableStructures, setAvailableStructures] = useState<string[]>( oracle.data.structures.map(s => s.name) );
	const [availableMasks, setAvailableMasks] = useState<string[]>( oracle.data.masks.map(m => m.name) );

	useEffect(() => {
		setAvailableStructures(oracle.data.structures.map(s => s.name));
		setAvailableMasks(oracle.data.masks.map(m => m.name));
	}, [oracle]);

	useEffect(() => {
		setOracle(editor => editor.updateServiceOutput(input.serviceId, field) )
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


	// compute the list of masks
	const masks : { key: string, value: string | undefined, label: string }[] = [{
		value: undefined,
		label: 'None',
		key: "mask-none",
	}];
	availableMasks.forEach((mask, index) => {
		masks.push({
			key: `mask-${index}`,
			value: mask,
			label: mask,
		});
	});


	return <SmallCardEdition name={field.name} onRemove={() => input.onRemoveField()}>
		<Input variant={'outlined'} size={'md'} label={'Name'} value={fieldName}
			   onChange={(event) => {
				   const name = event.target.value;
				   setFieldName(name);
				   setOracle(e => e.updateServiceOutput(
					   serviceId,
					   {...field, name}
				   ))
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
					setFieldType(event)
					setOracle(e => e.updateServiceOutput(
						serviceId,
						{...field, type: event}
					))
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
					setOracle(e => e.updateServiceOutput(
						serviceId,
						{...field, isList: checked}
					))
				}}/>
				<Checkbox label={'Required'} checked={isRequired} onChange={event => {
					const checked = event.target.checked;
					setIsRequired(checked);
					setOracle(e => e.updateServiceOutput(
						serviceId,
						{...field, isRequired: checked}
					))
				}}/>
				<Checkbox label={'Hashable'} checked={isHashable} onChange={event => {
					const checked = event.target.checked;
					setIsHashable(checked);
					setOracle(e => e.updateServiceOutput(
						serviceId,
						{...field, isHashable: checked}
					))
				}}/>
			</div>


			{/* Select the type of used mask */}
			<Select
				label="Mask"
				value={fieldMask}
				menuProps={{ className: 'max-h-48 overflow-auto' }}
				onChange={event => {
					if (!event) return;
					setFieldMask(event);
					setOracle(e => e.updateServiceOutput(
						serviceId,
						{...field, mask: event}
					))
				}}>

				{
					masks.map((entry) =>
						<Option key={entry.key} value={entry.value}>{entry.label}</Option>,
					)
				}
			</Select>
		</div>
	</SmallCardEdition>

}
