import { Box, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { Dialog } from '@material-tailwind/react';

export type ConfirmationModalProps<T> = {
	title: string,
	message: string,
	yes: string,
	no: string,
	onYes: (data:T) => void,
}
export default function useConfirmationModal<T>(props: ConfirmationModalProps<T>): [() => void, Dispatch<SetStateAction<T|null>>] {
	const [state, setState] = useState<T|null>(null);

	function accept() {
		if (state !== null) {
			props.onYes(state);
			hideModal();
		}

	}

	const [showModal, hideModal] = useModal(() =>
		<Dialog open={true}>
			<DialogTitle>{props.title}</DialogTitle>
			<DialogContent>
				<Box mt={2} sx={{width: "100%"}}>
					{props.message}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={hideModal} className={"bg-white"}>{props.no}</Button>
				<Button onClick={accept}   variant={"contained"} color="primary">{props.yes}</Button>
			</DialogActions>
		</Dialog>
	,[state]);

	return [showModal, setState]
}