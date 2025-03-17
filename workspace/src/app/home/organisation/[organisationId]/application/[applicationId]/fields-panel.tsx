import { useState } from 'react';
import { Button } from '@material-tailwind/react';
import { useToast } from '@/app/layout';
import ApplicationFieldEditionCard
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-component';
import { useFieldEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import { applicationFieldsAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import InputInTableRow from '@/components/input-in-table-row';

export default function FieldsPanel() {

	const fields = useAtomValue(applicationFieldsAtom);
	const fieldEditionActions = useFieldEdition();

	function addField(fieldName: string) {
		fieldEditionActions.addField(fieldName);
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
				<TableCell>Category</TableCell>
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
				<InputInTableRow label={"Add field"} colSpan={9} onSubmit={addField}/>
			</TableBody>

		</Table>
	</>;
}
