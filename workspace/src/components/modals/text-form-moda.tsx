import { useModal } from 'react-modal-hook';
import { Dialog } from '@material-tailwind/react';
import { Button, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

export type TextFieldFormModalProps = {
	title: string,
	placeholder: string,
	onSubmit: (value: string) => void,
}
export default function useTextFieldFormModal(props: TextFieldFormModalProps) {
	const [name, setName] = useState('');

	const [showModal, hideModal] = useModal(() => (
		<Dialog open={true}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<TextField size={"small"} fullWidth autoFocus placeholder={props.placeholder} value={name} onChange={(e) => setName(e.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={() => hideModal()}>Cancel</Button>
				<Button onClick={() => { props.onSubmit(name); hideModal(); }} variant={"contained"}>Create</Button>
			</DialogActions>
		</Dialog>
	), [name]);

	return showModal;
}