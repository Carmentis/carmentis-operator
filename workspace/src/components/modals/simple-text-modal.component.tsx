'use client';

import { FormEvent, useState } from 'react';

export default function SimpleTextModalComponent(input: {
	label: string,
	onSubmit: (data:string) => void,
	onClose: () => void,
	placeholder: string
}) {

	const [data, setData] = useState('');

	function onSubmit(event: FormEvent) {
		event.preventDefault();
		input.onSubmit(data);
	}

	return <div className={"fixed left-0 top-0 h-screen w-screen justify-center items-center flex"} onClick={input.onClose}>
		<form className={"bg-white flex flex-col p-4 rounded space-y-2 border-2 border-gray-100 opacity-100 shadow"} onSubmit={onSubmit} onClick={(e) => e.stopPropagation() }>
			<label htmlFor="modalInputName" className={"text-black opacity-100"}> {input.label}</label>
			<input autoFocus={true} type="text" id={"modalInputName"} value={data} onChange={(event) => setData(event.target.value)} className={"focus-visible:ring-0 focus-visible:border-transparent focus:ring-0 focus:ring-offset-0 outline-none"} placeholder={input.placeholder}/>
		</form>
	</div>
}