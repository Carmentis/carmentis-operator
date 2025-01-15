import InputButtonForm from '@/components/form/input-button.form';
import { Input } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { useApplicationMask, useUpdateApplication } from '@/contexts/application-store.context';
import { useSetEditionStatus } from '@/contexts/edition-status.context';
import SmallCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/small-edition-card';
import { AppDataMask } from '@/entities/application.entity';

function MaskEditionCard(
	input: {
		mask: AppDataMask
	},
) {
	const mask = input.mask;
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();


	const [name, setName] = useState<string>(mask.name);
	const [expression, setExpression] = useState<string>(mask.regex);
	const [substitution, setSubstitution] = useState<string>(mask.substitution);

	useEffect(() => {
		setApplication((application, editor) => {
			editor.updateMask(mask.name, {
				name: name,
				regex: expression,
				substitution: substitution,
			});
		});
	}, [name, expression, substitution]);

	function removeMask() {
		setApplication((application, editor) => {
			editor.removeMaskByName(mask.name);
		});
		setIsModified(true);
	}

	function updateName(name: string) {
		setIsModified(true);
		setName(name);
	}

	function updateExpression(expression: string) {
		setIsModified(true);
		setExpression(expression);
	}

	function updateSubsitution(subsitution: string) {
		setIsModified(true);
		setSubstitution(subsitution);
	}

	return <SmallCardEdition name={mask.name} onRemove={removeMask}>
			<Input variant={'outlined'} size={'md'} label={'Name'}
				   value={name} onChange={(e) => updateName(e.target.value)} />
			<Input variant={'outlined'} size={'md'} label={'Expression'}
				   value={expression} onChange={(e) => updateExpression(e.target.value)} />
			<Input variant={'outlined'} size={'md'} label={'Subsitution'}
				   value={substitution} onChange={(e) => updateSubsitution(e.target.value)} />

	</SmallCardEdition>;
}

export default function MasksPanel() {

	const masks = useApplicationMask();
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();

	function createMask(name: string) {
		setApplication((application, editor) => {
			editor.createMaskByName(name);
		});
		setIsModified(true);
	}


	return <>
		{/* enum creation */}
		<InputButtonForm
			inputLabel={'Name'}
			buttonLabel={'Add Mask'}
			onConfirm={(value) => createMask(value)}
		/>

		<div className="flex flex-wrap gap-4">
			{
				masks.map((mask, index) => {
					return <MaskEditionCard
						mask={mask}
						key={index}
					/>;
				})
			}
		</div>
	</>;
}
