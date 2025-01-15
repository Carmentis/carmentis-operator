import { Button, ButtonProps } from '@material-tailwind/react';
import { FC } from 'react';

interface ButtonWrapperProps extends Omit<ButtonProps, 'onClick'> {
	text: string;
	onClick: () => void;
}

const ButtonWrapper: FC<ButtonWrapperProps> = ({ text, onClick }) => {
	return (
		<Button onClick={onClick}>
			{text}
		</Button>
	);
};

export default ButtonWrapper;