import { FormEvent, useState } from 'react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { Button, Input, Typography } from '@material-tailwind/react';
import LargeCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/large-edition-card';
import ApplicationFieldEditionCard
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';
import { useApplicationStrutures, useUpdateApplication } from '@/contexts/application-store.context';
import { useSetEditionStatus } from '@/contexts/edition-status.context';
import Form from 'next/form';


function FieldCreationForm(
	input: {
		onCreateField: (fieldName: string) => void,
	}
) {
	const [name, setName] = useState<string>('');

	function submit() {
		const value = name;
		setName('');
		input.onCreateField(value)
	}
	return <>
		<div className="w-64">
			<Input label={'Name'} value={name}
				   onChange={e => setName(e.target.value)}
				   className={'w-14'} />
		</div>;
		<Button size={'md'} onClick={submit}>Add Field</Button>
	</>;
}





export default function StructurePanel(
) {

	const structures = useApplicationStrutures();
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();
	const [structureName, setStructureName] = useState<string>('');


	function createStructure(event: FormEvent) {
		event.preventDefault();
		setStructureName('');
		setIsModified(true);
		setApplication((app, editor) => {
			editor.createStructure(structureName);
		});
	}

	function createFieldInStructure( structureName: string, fieldName: string ) {
		setIsModified(true);
		setApplication((app, editor) => {
			editor.createFieldInStructure(structureName, fieldName);
		});
	}

	function removeStructure(structureName: string) {
		setIsModified(true);
		setApplication((app, editor) => {
			editor.removeStructureByName(structureName)
		});
	}

	function removeFieldFromStructure(structureName: string, fieldName: string) {
		setIsModified(true);
		setApplication((app, editor) => {
			editor.removeFieldInStructureByName(structureName, fieldName);
		});
	}

	return <>
		{/* Structure search and creation */}
		<div className={'flex flex-row p-1 gap-2 mt-4 mb-4'}>
			<form onSubmit={createStructure} className={'flex space-x-2'}>
				<div className="w-64">
					<Input label={'name'} value={structureName} onChange={e => setStructureName(e.target.value)}
						   className={'w-14'} />
				</div>
				<Button size={'md'}>Add structure</Button>
			</form>
		</div>


		{/* List of structures */}
		<div id="fields" className={'flex flex-wrap gap-4'}>
			{
				structures
					.map((struct, index) =>
						<LargeCardEdition
							key={index}
							name={struct.name}
							onRemove={() => removeStructure(struct.name)}>
							<Input variant={'outlined'} size={'md'} label={'Name'} value={struct.name} />

							{/* Fields in the structure */}
							<div id="fields">

								<Typography variant={'h6'}>Fields</Typography>

								{/* Search and add field */}
								<div className={'flex flex-row gap-2 mt-2 mb-4'}>
									<FieldCreationForm onCreateField={(fieldName: string) => {
										createFieldInStructure(struct.name, fieldName);
									}}/>
								</div>
								<div className="flex flex-wrap gap-4">
									{
										struct.properties
											.map((field, index) => {
												return <ApplicationFieldEditionCard
													structureName={struct.name}
													key={index}
													field={field}
													onRemoveField={() => removeFieldFromStructure(
														struct.name,
														field.name
													)} />;
											})
									}
								</div>
							</div>
						</LargeCardEdition>
					)
			}
		</div>
	</>;
}
