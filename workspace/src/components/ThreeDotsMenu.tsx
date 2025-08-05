import * as React from 'react';
import { PropsWithChildren } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { alpha, IconButton, Menu, useTheme } from '@mui/material';


export default function ThreeDotsMenu({children}: PropsWithChildren) {
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div>
			<IconButton
				id="organisation-menu-button"
				aria-controls={open ? 'organisation-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
				size="small"
				sx={{
					bgcolor: alpha(theme.palette.primary.main, 0.1),
					backdropFilter: 'blur(5px)',
					'&:hover': {
						bgcolor: alpha(theme.palette.primary.main, 0.2),
					}
				}}
			>
				<MoreVertIcon color="primary" />
			</IconButton>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				slotProps={{
					list: {
						'aria-labelledby': 'basic-button',
					},
				}}
			>
				{children}
			</Menu>
		</div>
	);
}