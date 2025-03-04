import { AppDataEnum } from '@/entities/application.entity';
import { useEnumerationEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import {
	applicationEnumerationsAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import {
	Accordion, AccordionDetails,
	AccordionSummary, Box,
	Chip,
	TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Button, IconButton } from '@material-tailwind/react';


export default function EnumerationPanel() {
	const enumerations = useAtomValue(applicationEnumerationsAtom)
	const edition = useEnumerationEdition();


	return <EnumerationsView
		enumerations={enumerations}
		addEnum={edition.add}
		editEnum={edition.edit}
		removeEnum={edition.remove}
		addEnumValue={edition.addEnumValue}
		removeEnumValue={edition.removeEnumValue}
	/>

}


type EnumerationsViewProps = {
	enumerations: AppDataEnum[]
	addEnum: (enumName: string) => void,
	editEnum: (enumId: string, enumeration: AppDataEnum) => void,
	removeEnum: (enumId: string) => void,
	addEnumValue: (enumId: string, value: string) => void,
	removeEnumValue: (enumId: string, value: string) => void,
}
export function EnumerationsView( input: EnumerationsViewProps ) {
	const [name, setName] = useState('');
	return <>

		<div className={'flex flew-row gap-2 my-4'}>
			<TextField value={name} size={'small'} onChange={e => setName(e.target.value)}></TextField>
			<Button onClick={() => input.addEnum(name)}>Add enumeration</Button>
		</div>

		{
			input.enumerations.map(enumeration => {
				return <SingleEnumerationView
					key={enumeration.id}
					enumeration={enumeration}
					{...input}
				/>;
			})
		}
	</>;
}

function SingleEnumerationView(
	input: { enumeration: AppDataEnum } & EnumerationsViewProps,
) {

	const enumeration = input.enumeration;
	const [name, setName] = useState(enumeration.name);
	const [newValue, setNewValue] = useState("");


	useEffect(() => {
		input.editEnum(enumeration.id, {
			...enumeration,
			name
		})
	}, [name]);



	return  <>
		<Accordion>
			<AccordionSummary>
				Enumeration {enumeration.name}
			</AccordionSummary>
			<AccordionDetails>
				<Box display={"flex"} justifyContent={"space-between"}>
					<div>
						<TextField size={'small'} value={name} onChange={(e) => setName(e.target.value)} label={"Enumeration name"} />

					</div>
					<div>
						<TextField size={"small"} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
						<Button onClick={() => input.addEnumValue(enumeration.id, newValue)}>Add value</Button>
					</div>
				</Box>
				<Box display={"flex"} flexWrap={"wrap"} gap={2} my={4}>
					{
						enumeration.values.map(v => {
							return <Chip key={v}
										 label={v}
										 variant="outlined"
										 onDelete={() =>  input.removeEnumValue(enumeration.id, v)} />
						})
					}
				</Box>
				<IconButton onClick={() => input.removeEnum(enumeration.id)}>
					<i className={"bi bi-trash"}/>
				</IconButton>
			</AccordionDetails>
		</Accordion>
	</>
}
