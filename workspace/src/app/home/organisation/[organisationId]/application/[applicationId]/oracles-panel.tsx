import { useAtomValue } from 'jotai/index';
import { applicationOraclesAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import {
	useApplicationOraclesEdition,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { AppDataOracle } from '@/entities/application.entity';
import { useEffect, useState } from 'react';
import {
	Box, DialogActions,
	DialogContent,
	DialogTitle, Icon, List, ListItem, ListItemButton, ListItemText,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
} from '@mui/material';
import { Button, Dialog, IconButton, Typography } from '@material-tailwind/react';
import { OnChainOracle, useFetchOraclesOnChain } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';

export default function OraclesPanel() {

	const oracles = useAtomValue(applicationOraclesAtom);
	const edition = useApplicationOraclesEdition();


	return <ApplicationOraclesView
		oracles={oracles}
		addOracle={edition.add}
		editOracle={edition.edit}
		removeOracle={edition.remove}
	/>
}


type ApplicationOraclesViewProps = {
	oracles: AppDataOracle[]
	addOracle: (name: string, oracle: OnChainOracle) => void,
	editOracle: (oracleId: string, oracle: AppDataOracle) => void,
	removeOracle: (oracleId: string) => void,
}
function ApplicationOraclesView( input: ApplicationOraclesViewProps ) {
	const [open, setOpen] = useState(false)



	return <>
		<SearchOracleModal open={open} onClose={() => setOpen(false)} onSelect={(name,oracle) => {
			setOpen(false);
			input.addOracle(name, oracle);
		}}/>
			<Box display="flex" flexDirection="row" gap={2}>
			<Table id="fields" className={'w-full'}>
				<TableHead>
					<TableRow>
						<TableCell>Displayed Name</TableCell>
						<TableCell>Oracle Name</TableCell>
						<TableCell>Oracle Hash</TableCell>
						<TableCell>Oracle Service</TableCell>
						<TableCell>Oracle Version</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody className={'w-full'}>
					{
						input.oracles.map(oracle => {
							return <SingleApplicationOracleView
								key={oracle.id}
								oracle={oracle}
								{...input}
							/>
						})
					}
					<TableRow>
						<TableCell colSpan={6}>
							<Button onClick={() => setOpen(true)}>Add oracle</Button>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Box>
	</>;
}


function SearchOracleModal({ open, onClose, onSelect } : {open: boolean, onClose: () => void, onSelect: (name: string, oracle: OnChainOracle) => void}) {
	const [search, setSearch] = useState('');
	const [name, setName] = useState('');
	const [error, setError] = useState('');
	const { data } = useFetchOraclesOnChain();

	const isIncludedIn = (a: string, b: string | number) => {
		const c = typeof b === 'string' ? b : b.toString();
		return a.toLowerCase().includes(c.toLowerCase());
	};

	useEffect(() => {
		setError('')
	}, [name]);

	function selectOracle(o: OnChainOracle) {
		if (name === '') {
			setError("Empty oracle name")
		} else {
			setName("")
			onSelect(name, o)
		}
	}

	let content = <Skeleton />;
	if (error) content = <Typography>An error occurred: {error}</Typography>;
	if (data) {
		const items = data
			.filter(o => Object.values(o).some(v => isIncludedIn(search, v)))
			.map((o,i) => <ListItem key={i}
				className={'cursor-pointer hover:bg-gray-50 w-full'}>
				<ListItemText
					className={"w-full"}
					primary={`Oracle ${o.oracleName}, Service ${o.serviceName} (version ${o.version})`}
					secondary={`Hash: ${o.hash}`}
					onClick={() => selectOracle(o)}
				/>
			</ListItem>);
		content = <List dense={true} sx={{
			width: '100%', bgcolor: 'background.paper', height: '500px', maxHeight: '500px', overflowY: 'auto' }}>
			{items}
		</List>
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Add Oracle</DialogTitle>
			<DialogContent>
				<Box mb={2}>
					<Typography>Input the displayed name of the oracle.</Typography>
					<TextField error={error !== ''} helperText={error} required value={name} onChange={e => setName(e.target.value)} name="Displayed name" placeholder={"Displayed name"} size={"small"}/>
				</Box>
				<Typography>Enter the hash, the name of the oracle or a service to import an oracle from the chain.</Typography>
				<Box display="flex" flexDirection="row">
					<TextField
						size="small"
						placeholder="Hash, oracle name, service name..."
						fullWidth
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</Box>
				<Box mt={2} sx={{width: "100%"}}>
					{content}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">Close</Button>
			</DialogActions>
		</Dialog>
	);
}

type SingleApplicationOracleViewProps = { oracle: AppDataOracle } & ApplicationOraclesViewProps;
function SingleApplicationOracleView( input : SingleApplicationOracleViewProps ) {
	const oracle = input.oracle;
	const [name, setName] = useState(oracle.name);

	useEffect(() => {
		input.editOracle(oracle.id, {
			...oracle,
			name
		})
	}, [name]);

	return <TableRow>
		<TableCell>
			<TextField size={"small"} fullWidth value={name} onChange={e => setName(e.target.value)}></TextField>
		</TableCell>
		<TableCell>{oracle.oracleName}</TableCell>
		<TableCell>{oracle.oracleHash}</TableCell>
		<TableCell>{oracle.service}</TableCell>
		<TableCell>{oracle.version}</TableCell>
		<TableCell>
			<IconButton onClick={() => input.removeOracle(oracle.id)}>
				<i className={"bi bi-trash"}/>
			</IconButton>
		</TableCell>
	</TableRow>
}