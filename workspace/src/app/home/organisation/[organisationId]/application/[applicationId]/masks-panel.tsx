import InputButtonForm from '@/components/form/input-button.form';
import {
	useApplicationMask,
	useSetEditionStatus, useUpdateApplication,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import {
	AppDataMask,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {
	Card,
	CardBody,
	CardHeader,
	IconButton,
	Input,
	Typography,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';

function MaskEditionCard(
	input: {
		mask: AppDataMask
	},
) {
	const mask = input.mask;
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();


	const [name, setName] = useState<string>(mask.name);
	const [expression, setExpression] = useState<string>(mask.expression);
	const [substitution, setSubstitution] = useState<string>(mask.substitution);

	useEffect(() => {
		setApplication((application, editor) => {
			editor.updateMask(mask.name, {
				name: name,
				expression: expression,
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

	return <Card className={' w-72 shadow-lg'}>
		<CardHeader floated={false}
					shadow={false}
					color="transparent"
					className="m-0 rounded-none rounded-t-md bg-gray-800 p-2 flex justify-between items-center">

			<Typography variant={'h6'} color={'white'}>{mask.name}</Typography>

			{/* Icons */}
			<div id="icons" className={'flex gap-2'}>
				<IconButton variant={'filled'} color={'white'} size={'sm'}
							onClick={() => removeMask()}>
					<i className="bi bi-trash" />
				</IconButton>
			</div>
		</CardHeader>
		<CardBody className={'flex flex-col space-y-3'}>
			<Input variant={'outlined'} size={'md'} label={'Name'}
				   value={name} onChange={(e) => updateName(e.target.value)} />
			<Input variant={'outlined'} size={'md'} label={'Expression'}
				   value={expression} onChange={(e) => updateExpression(e.target.value)} />
			<Input variant={'outlined'} size={'md'} label={'Subsitution'}
				   value={substitution} onChange={(e) => updateSubsitution(e.target.value)} />
		</CardBody>
	</Card>;
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
