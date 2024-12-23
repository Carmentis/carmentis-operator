import { Card, CardBody, CardHeader, Chip, IconButton, Typography } from '@material-tailwind/react';
import {
	useApplicationEnum, useSetEditionStatus,
	useUpdateApplication,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import InputButtonForm from '@/components/form/input-button.form';
import { AppDataEnum } from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';

function MyChip(
	input: {
		enumId: string;
		enumValue: string;
		removeEnumValue: (enumValue: string) => void;
	}
) {
	return <div className={'border-2 border-gray-900  rounded-full flex flex-row items-center justify-center'}>
		<div className="value px-4">
			{input.enumValue}
		</div>
		<div className="cursor-pointer px-3 py-2 bg-gray-900 rounded-r-full text-white" onClick={() => input.removeEnumValue(input.enumValue)}>
			<i className={"bi bi-x-lg"}></i>
		</div>
	</div>
}

function EnumerationEditionCard(
	input: {
		enumeration: AppDataEnum
	}
) {

	const enumeration = input.enumeration;
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();

	function removeEnum() {
		setApplication((application, editor) => {
			editor.removeEnumerationByName(enumeration.name);
		})
		setIsModified(true);
	}

	function createEnumValue( value: string ) {
		setApplication((application, editor) => {
			editor.createValueInEnum(enumeration.name, value);
		})
		setIsModified(true);
	}

	function removeEnumValue(value: string) {
		setApplication((application, editor) => {
			editor.removeValueInEnum(enumeration.name, value);
		})
		setIsModified(true);
	}

	return <>
		<Card className={'border-2 border-gray-800 w-full'}>
			<CardHeader floated={false}
						shadow={false}
						color="transparent"
						className="m-0 rounded-none rounded-t-md p-2 bg-gray-800 flex justify-between">

				<Typography variant={'h6'} color={'white'}>{enumeration.name}</Typography>
				<IconButton variant={'filled'} color={'white'} size={'sm'}
							onClick={() => removeEnum()}>
					<i className="bi bi-trash" />
				</IconButton>
			</CardHeader>
			<CardBody className={'flex flex-col space-y-4'}>
				<InputButtonForm
					inputLabel={"Name"}
					buttonLabel={"Add value"}
					onConfirm={createEnumValue}/>

				<div className="values flex flex-wrap gap-2">
					{
						enumeration.values.map(v => {
							return <MyChip
								enumId={v.id}
								enumValue={v.value}
								removeEnumValue={(value) => removeEnumValue(value)}
							></MyChip>
						})
					}
				</div>

			</CardBody>
		</Card>
	</>
}

export default function EnumerationPanel() {
	const enumerations = useApplicationEnum();
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();

	function createEnumeration( name: string ) {
		setApplication((app, editor) => {
			editor.createEnumeration(name);
		})
		setIsModified(true);
	}

	return <>
		{/* enum creation */}
		<InputButtonForm
			inputLabel={"Name"}
			buttonLabel={"Add enumeration"}
			onConfirm={(value) => createEnumeration(value)}
		/>


		{/* List of enum */}
		<div id="fields" className={'flex flex-wrap gap-4'}>
			{
				enumerations.map((enumeration, index) => {
					return <EnumerationEditionCard
						key={index}
						enumeration={enumeration}
					/>
				})
			}
		</div>
	</>;
}
