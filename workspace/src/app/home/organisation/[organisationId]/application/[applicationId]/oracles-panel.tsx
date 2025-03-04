import { useAtomValue } from 'jotai/index';
import { applicationOraclesAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import {
	useApplicationOraclesEdition,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { AppDataOracle } from '@/entities/application.entity';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { Button } from '@material-tailwind/react';

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
	addOracle: (oracleName: string, oracleHash: string, service: string, version: number) => void,
	editOracle: (oracleId: string, oracle: AppDataOracle) => void,
	removeOracle: (oracleId: string) => void,
}
function ApplicationOraclesView( input: ApplicationOraclesViewProps ) {
	const [name, setName] = useState('');

	return <>

		<Table id="fields" className={'w-full'}>
			<TableHead>
				<TableRow>
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
					<TableCell colSpan={4}>
						<div className={"flex flew-row gap-2"}>
							<TextField value={name} size={"small"} onChange={e => setName(e.target.value)}></TextField>
							<Button >Add Oracle</Button>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</>;
}

type SingleApplicationOracleViewProps = { oracle: AppDataOracle } & ApplicationOraclesViewProps;
function SingleApplicationOracleView( input : SingleApplicationOracleViewProps ) {
	return <></>
}