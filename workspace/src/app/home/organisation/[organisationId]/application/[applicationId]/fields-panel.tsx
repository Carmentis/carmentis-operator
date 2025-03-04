import { useState } from 'react';
import { Button } from '@material-tailwind/react';
import { useToast } from '@/app/layout';
import ApplicationFieldEditionCard
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-component';
import { useFieldEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import { applicationFieldsAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

export default function FieldsPanel() {

	const notify = useToast();
	const fields = useAtomValue(applicationFieldsAtom);
	const fieldEditionActions = useFieldEdition();
	const [fieldName, setFieldName] = useState<string>('');

	function addField() {
		// aborts if the field name is empty
		if ( fieldName !== '' ) {
			fieldEditionActions.addField(fieldName);
			setFieldName('')
		}  else {
			notify.error("Cannot add field with an empty name")
		}
	}

	function removeField(fieldId: string) {
		fieldEditionActions.removeField(fieldId);
	}

	const content =
		fields.map(field =>
			<ApplicationFieldEditionCard
				key={field.id}
				field={field}
				onRemoveField={removeField} />)

	return <>
		{/* List of fields */}
		<Table id="fields" className={'w-full'}>
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
				{content}
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
	</>;
}
