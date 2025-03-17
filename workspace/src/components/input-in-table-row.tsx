import { ChangeEvent, FormEvent, FormEventHandler, useState } from 'react';
import { TableCell, TableRow, TextField } from '@mui/material';
import { Button } from '@material-tailwind/react';

interface InputInTableRowProps {
	label: string;
	colSpan: number;
	onSubmit: (value: string) => void;
}
export default function InputInTableRow(input: InputInTableRowProps) {
	const [value, setValue] = useState('');
	const [error, setError] = useState(false);

	function onClick() {
		if (value === '') {
			setError(true);
		} else {
			input.onSubmit(value);
			setValue('');
		}
	}

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		onClick();
	}

	function onChange(value: string) {
		setError(false)
		setValue(value);
	}

	return <TableRow>
		<TableCell colSpan={input.colSpan}>
			<form className={"w-[500px] flex gap-2"} onSubmit={onSubmit}>
				<TextField size={'small'} value={value} onChange={e => onChange(e.target.value)}
						   error={error}
						   className={""}/>
				<Button size={'md'} className={"w-[150px]"} onClick={onClick}>{input.label}</Button>
			</form>
		</TableCell>
	</TableRow>
}