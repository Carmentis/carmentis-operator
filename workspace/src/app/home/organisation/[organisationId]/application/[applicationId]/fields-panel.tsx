import {
	ApplicationEditor, AppDataField,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {  useEffect, useState } from 'react';
import {
	useApplication, useUpdateApplication, useSetEditionStatus, useApplicationFields,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import { Button, Input } from '@material-tailwind/react';
import FieldEditionCard from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';

export default function FieldsPanel(
	input: {
		appEditor: ApplicationEditor,
		availableStructures: string[]
	},
) {

	const applicationFields = useApplicationFields();
	const updateApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();
	const [fieldName, setFieldName] = useState<string>('');
	const [fields, setFields] = useState<AppDataField[]>(applicationFields);

	useEffect(() => {
		setFields(applicationFields);
	}, [applicationFields]);

	function addField() {
		setFieldName('')
		setIsModified(true);
		updateApplication(application => {
			const editor = new ApplicationEditor(application)
			editor.createField(fieldName)
		})
	}

	function removeField(fieldName: string) {
		setIsModified(true);
		updateApplication(application => {
			const editor = new ApplicationEditor(application)
			editor.removeFieldByName(fieldName)
		})
	}


	return <>
		{/* Field creation */}
		<div id="add-field" className={'flex flex-row p-1 gap-2 mt-4 mb-4'}>
			<div className="w-64">
				<Input label={'name'} value={fieldName} onChange={e => setFieldName(e.target.value)}
					   className={'w-14'} />
			</div>
			<Button size={'md'} color={'default'} onClick={addField}>Add field</Button>
		</div>


		{/* List of fields */}
		<div id="fields" className={'flex flex-wrap gap-4'}>
			{
				fields.map((field, index) =>
					<FieldEditionCard
						key={index}
						availableStructures={input.availableStructures}
						field={field}
						onRemoveField={removeField} />)
			}
		</div>
	</>;
}
