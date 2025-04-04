'use client';

import React, { createContext, useContext, useState, ReactNode, ReactElement } from 'react';
import { Box, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { Dialog } from '@material-tailwind/react';

interface ModalContextType {
	openModal: (options: {content: ReactElement}) => void;
	closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
	children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState<ReactElement | null>(null);

	const openModal = (options: {content: ReactElement}) => {
		setContent(options.content);
		setOpen(true);
	};

	const closeModal = () => {
		setContent(null);
		setOpen(false);
	};

	return (
		<ModalContext.Provider value={{ openModal, closeModal }}>
			{children}
			<Dialog open={open} onClose={closeModal} maxWidth="sm" fullWidth>
				{content}
			</Dialog>
		</ModalContext.Provider>
	);
};

export const useModal = (): ModalContextType => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
};




export const useConfirmationModal = () => {
	const modal = useModal();
	return (title: string, message: string, yes: string, no: string, onYes: () => void) => {

		function accept() {
			modal.closeModal();
			onYes();
		}

		modal.openModal({
			content: <>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>
					<Box mt={2} sx={{width: "100%"}}>
						{message}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={accept} color="primary">{yes}</Button>
					<Button onClick={modal.closeModal} variant={"outlined"} className={"bg-white"}>{no}</Button>
				</DialogActions>
			</>
		})
	}
};
