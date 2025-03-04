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
	AccordionSummary,
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
	editStruct: (structName: string, structure: AppDataStruct) => void
	removeStruct: (structName: string) => void
	addField: (structName: string, fieldName: string) => void
	editField: (structName: string, fieldName: string, field: AppDataField) => void,
	removeField: (structName: string, fieldName: string) => void
}



export function StructuresView(input: StructuresViewProps) {
	const [structName, setStructName] = useState('');
	return <div>
		<TextField value={structName} onChange={(e) => setStructName(e.target.value)} size={"small"} />
		<Button size={"md"} onClick={() => input.addStruct(structName)}>Add structure</Button>
		{
			input.structures
				.map((struct, index) => <SingleStructureView structure={struct} {...input} key={struct.id}/>)
		}
	</div>;

}

function SingleStructureView(input: {
	structure: AppDataStruct,
	editStruct: (structId: string, structure: AppDataStruct) => void,
	removeStruct: (structId: string) => void,
	addField: (structId: string, fieldName: string) => void
	editField: (structId: string, fieldId: string, field: AppDataField) => void,
	removeField: (structId: string, fieldId: string) => void
}) {
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
	addField: (structName: string, fieldName: string) => void
	editField: (structName: string, fieldName: string, field: AppDataField) => void,
	removeField: (structName: string, fieldName: string) => void
}
function StructureFieldsView(input: StructureFieldsViewProps) {
	const [fieldName, setFieldName] = useState('');
	const structure = input.structure;
	const structName = structure.name;
	const fields = input.structure.properties;

	function addField() {
		input.addField(structName, fieldName)
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
						onRemoveField={name => input.removeField(structName, name)} />)
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


