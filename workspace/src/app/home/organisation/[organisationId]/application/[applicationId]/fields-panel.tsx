import {
	ApplicationEditor, AppDataField,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {  useEffect, useState } from 'react';
import { Button, Input } from '@material-tailwind/react';
import { useToast } from '@/app/layout';
import ApplicationFieldEditionCard
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';
import { useApplicationFields, useUpdateApplication } from '@/contexts/application-store.context';
import { useSetEditionStatus } from '@/contexts/edition-status.context';

export default function FieldsPanel() {

	const notify = useToast();
	const applicationFields = useApplicationFields();
	const updateApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();
	const [fieldName, setFieldName] = useState<string>('');
	const [fields, setFields] = useState<AppDataField[]>(applicationFields);

	useEffect(() => {
		setFields(applicationFields);
	}, [applicationFields]);

	/**
	 * Add a new field.
	 */
	function addField() {
		// aborts if the field name is empty
		if ( fieldName !== '' ) {
			setFieldName('')
			setIsModified(true);
			updateApplication(application => {
				const editor = new ApplicationEditor(application)
				editor.createField(fieldName)
			})
		}  else {
			notify.error("Cannot add field with an empty name")
		}

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
					<ApplicationFieldEditionCard
						key={index}
						field={field}
						onRemoveField={removeField} />)
			}
		</div>
	</>;
}
