import { Button, IconButton } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { AppDataMask } from '@/entities/application.entity';
import { useMaskEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import { applicationMasksAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import InputInTableRow from '@/components/input-in-table-row';

export default function MasksPanel() {
	const masks = useAtomValue(applicationMasksAtom);
	const edition = useMaskEdition();

	return <MasksView
		masks={masks}
		addMask={edition.add}
		editMask={edition.edit}
		removeMask={edition.remove}
	/>
}


type MasksViewProps = {
	masks: AppDataMask[]
	addMask: (maskName: string) => void,
	editMask: (maskId: string, mask: AppDataMask) => void,
	removeMask: (maskId: string) => void,
}
export function MasksView( input: MasksViewProps ) {
	const [name, setName] = useState('');

	return <>

		<Table id="fields" className={'w-full'}>
			<TableHead>
				<TableRow>
					<TableCell>Mask Name</TableCell>
					<TableCell>Mask Regex</TableCell>
					<TableCell>Mask Substitution</TableCell>
					<TableCell></TableCell>
				</TableRow>
			</TableHead>
			<TableBody className={'w-full'}>
				{
					input.masks.map((mask, index) => {
						return <SingleMaskView
							key={mask.id}
							mask={mask}
							{...input}
						/>
					})
				}
				<InputInTableRow label={"Add mask"} colSpan={4} onSubmit={input.addMask}/>
			</TableBody>
		</Table>
	</>;
}


type SingleMaskViewProps = { mask: AppDataMask } & MasksViewProps
function SingleMaskView(input: SingleMaskViewProps) {
	const [maskName, setMaskName] = useState(input.mask.name);
	const [maskRegex, setMaskRegex] = useState(input.mask.regex);
	const [maskSub, setMaskSub] = useState(input.mask.substitution);

	useEffect(() => {
		input.editMask(input.mask.id, {
			...input.mask,
			name: maskName,
			substitution: maskSub,
			regex: maskRegex
		})
	}, [maskName, maskRegex, maskSub]);

	const cells = [
		{ value: maskName, onChange: (e: string) => setMaskName(e) },
		{ value: maskRegex, onChange: (e: string) => setMaskRegex(e) },
		{ value: maskSub, onChange: (e: string) => setMaskSub(e) },
	]
	return <TableRow>
		{
			cells.map((c, index) => <TableCell key={`${input.mask.id}-${index}`}>
				<TextField fullWidth size={"small"} value={c.value} onChange={e => c.onChange(e.target.value)}></TextField>
			</TableCell> )
		}
		<TableCell>
			<IconButton onClick={() => input.removeMask(input.mask.id)}>
				<i className={"bi bi-trash"}/>
			</IconButton>
		</TableCell>
	</TableRow>
}