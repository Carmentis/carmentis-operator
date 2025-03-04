import { AppDataEnum } from '@/entities/application.entity';
import { useEnumerationEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import {
	applicationEnumerationsAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Button } from '@material-tailwind/react';


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

		<Table id="fields" className={'w-full'}>
			<TableHead>
				<TableRow>
					<TableCell>Name</TableCell>
					<TableCell>Values</TableCell>
					<TableCell></TableCell>
				</TableRow>
			</TableHead>
			<TableBody className={'w-full'}>
				{
					input.enumerations.map((enumeration, index) => {
						return <SingleEnumerationView
							key={index}
							enumeration={enumeration}
							{...input}
						/>
					})
				}
				<TableRow>
					<TableCell>
						<div className={"flex flew-row gap-2"}>
							<TextField value={name} size={"small"} onChange={e => setName(e.target.value)}></TextField>
							<Button onClick={() => input.addEnum(name)}>Add enumeration</Button>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</>;
}

function SingleEnumerationView(
	input: { enumeration: AppDataEnum } & EnumerationsViewProps
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
		<TableRow>
			<TableCell>
				<TextField size={'small'} value={name} onChange={(e) => setName(e.target.value)} />
			</TableCell>
			<TableCell>
			<div className={"w-full flex flex-wrap gap-2"}>
				{
					enumeration.values.map(v => {
						return <Chip key={v}
									 label={v}
									 variant="outlined"
									 onDelete={() =>  input.removeEnumValue(enumeration.id, v)} />
					})
				}
			</div>
			</TableCell>
			<TableCell>
				<TextField size={"small"} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
				<Button onClick={() => input.addEnumValue(enumeration.id, newValue)}>Add value</Button>
			</TableCell>
		</TableRow>
	</>
}
