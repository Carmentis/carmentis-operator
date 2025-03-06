import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '@material-tailwind/react';
import {
	FieldEditionComponent,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-component';
import { useStructEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import { applicationStructuresAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary, Box,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
} from '@mui/material';
import { AppDataField, AppDataStruct } from '@/entities/application.entity';


export default function StructurePanel(
) {

	const structures = useAtomValue(applicationStructuresAtom)
	const structureEdition = useStructEdition();


	return <StructuresView
		structures={structures}
	 	addField={structureEdition.addField}
		editField={structureEdition.editField}
		removeField={structureEdition.removeField}

		addStruct={structureEdition.add}
		editStruct={structureEdition.edit}
		removeStruct={structureEdition.remove}
	/>


}

type StructuresViewProps = {
	structures: AppDataStruct[],
	addStruct: (structName: string) => void
	editStruct: (structId: string, structure: AppDataStruct) => void
	removeStruct: (structId: string) => void
	addField: (structId: string, fieldName: string) => void
	editField: (structId: string, fieldId: string, field: AppDataField) => void,
	removeField: (structId: string, fieldId: string) => void
}



export function StructuresView(input: StructuresViewProps) {
	const [structName, setStructName] = useState('');
	return <div>
		<Box display={"flex"} flexDirection={"row"} mb={2} gap={2}>
			<TextField value={structName} onChange={(e) => setStructName(e.target.value)} size={"small"} />
			<Button size={"md"} onClick={() => input.addStruct(structName)}>Add structure</Button>
		</Box>
		{
			input.structures
				.map((struct, index) => <SingleStructureView structure={struct} {...input} key={struct.id}/>)
		}
	</div>;

}

type SingleStructureViewProps = {structure: AppDataStruct} & StructuresViewProps;
function SingleStructureView(input: SingleStructureViewProps) {
	const struct = input.structure;
	const [structName, setStructName] = useState(struct.name);

	useEffect(() => {
		input.editStruct(struct.id, {...struct, name: structName})
	}, [structName]);

	return <Accordion >
		<AccordionSummary
			aria-controls="panel1-content"
			id="panel1-header"
		>
			Structure {struct.name}
		</AccordionSummary>
		<AccordionDetails>
			<div className={"flex justify-between items-center"}>
				<TextField size={"small"} label={"Structure name"} value={structName} onChange={e => setStructName(e.target.value)}/>
				<IconButton color={"primary"} onClick={() => input.removeStruct(struct.id)}>
					<i className={"bi bi-trash"}></i>
				</IconButton>
			</div>
			<StructureFieldsView {...input}/>
		</AccordionDetails>
	</Accordion>
}

type StructureFieldsViewProps = {
	structure: AppDataStruct,
	addField: (structId: string, fieldName: string) => void
	editField: (structId: string, fieldId: string, field: AppDataField) => void,
	removeField: (structId: string, fieldId: string) => void
}
function StructureFieldsView(input: StructureFieldsViewProps) {
	const [fieldName, setFieldName] = useState('');
	const structure = input.structure;
	const fields = input.structure.properties;

	function addField() {
		input.addField(structure.id, fieldName)
		setFieldName('')
	}

	return <Table id="fields" className={'w-full'}>
		<TableHead>
			<TableRow>
				<TableCell>Name</TableCell>
				<TableCell>Kind</TableCell>
				<TableCell>Type</TableCell>
				<TableCell>Array</TableCell>
				<TableCell>Required</TableCell>
				<TableCell>Public</TableCell>
				<TableCell>Hashable</TableCell>
				<TableCell>Mask</TableCell>
				<TableCell></TableCell>
			</TableRow>
		</TableHead>
		<TableBody className={'w-full'}>
			{
				fields.map(field =>
					<FieldEditionComponent
						key={field.id}
						field={field}
						onUpdateField={updatedField => input.editField(input.structure.id, field.id, updatedField)}
						onRemoveField={() => input.removeField(structure.id, field.id)} />)
			}
			<TableRow>
				<TableCell colSpan={8}>
					<div className={"w-[500px] flex gap-2"}>
						<TextField size={'small'} value={fieldName} onChange={e => setFieldName(e.target.value)}
								   className={""}/>
						<Button size={'md'} className={"w-[150px]"} onClick={addField}>Add field</Button>
					</div>
				</TableCell>
			</TableRow>
		</TableBody>
	</Table>
}


