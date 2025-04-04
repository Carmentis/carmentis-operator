import { ReactNode } from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';

export type GenericTableComponentProps<T> = {
	isLoading?: boolean,
	error?: any,
	data: T[] | undefined,
	extractor: (row: T, index: number) => {head: string, value: ReactNode}[],
	onRowClicked?: (row: T) => void,
	wrapTable?: (table: ReactNode) => ReactNode,
}
export default function GenericTableComponent<T>(
	{data, isLoading, error, extractor, onRowClicked, wrapTable}: GenericTableComponentProps<T>
) {
	if (error) {
		let errorMessage =  '';
		if (typeof error === 'string') {
			errorMessage = error;
		} else if ( 'message' in error ) {
			errorMessage = error.message;
		}


		return <Box display={"flex"} justifyContent={"center"} alignItems={"center"} width={"100%"} height={"300px"} component={Paper}>
			An error occurred. Please try again later.
			{errorMessage}
		</Box>
	}
	if (isLoading || !data) {
		return <Box display="flex" flexDirection="column">
			<Skeleton height={50} className={"mb-2"}/>
			<Skeleton count={10} />
		</Box>
	}
	let content = <Typography>No entry found</Typography>;
	if (data.length !== 0) {
		const heads = extractor(data[0]).map(d => d.head);
		content = <TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						{heads.map((head) => (
							<TableCell
								key={head}
								sx={{p: 1}}
							>
								<Typography fontWeight={"bold"}>{head}</Typography>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map((row, index) => (
						<TableRow
							key={index}
							className={'cursor-pointer hover:bg-gray-50 [&>td]:p-2'}
							onClick={() => onRowClicked && onRowClicked(row)}
						>
							{
								extractor(row, index).map((result, index) => {
									return <TableCell key={index}>
										{result.value}
									</TableCell>
								})
							}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>

	}

	return wrapTable ? wrapTable(content) : <>{content}</>
}