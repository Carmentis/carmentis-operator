import { Button, Input } from '@material-tailwind/react';
import { useState } from 'react';

export default function InputButtonForm(
	input: {
		inputLabel: string;
		buttonLabel: string;
		onConfirm: (value: string) => void;
	}
) {

	const [value, setValue] = useState('');

	function onClick() {
		input.onConfirm(value);
		setValue('');
	}

	return <div className={'flex flex-row p-1 gap-2 mt-4 mb-4'}>
		<div className="w-64">
			<Input label={input.inputLabel}
				   value={value}
				   onChange={e => setValue(e.target.value)}
				   className={'w-14'} />
		</div>
		<Button size={'md'} onClick={onClick}>
			{input.buttonLabel}
		</Button>
	</div>
}