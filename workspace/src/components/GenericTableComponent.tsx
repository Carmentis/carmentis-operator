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
	extractor: (row: T, index: number) => { head: string, value: ReactNode }[],
	onRowClicked?: (row: T) => void,
	wrapTable?: (table: ReactNode) => ReactNode,
}

export default function GenericTableComponent<T>(
	{ data, isLoading, error, extractor, onRowClicked, wrapTable }: GenericTableComponentProps<T>,
) {
	const renderError = (error: any): ReactNode => {
		let errorMessage = '';
		if (typeof error === 'string') {
			errorMessage = error;
		} else if ('message' in error) {
			errorMessage = error.message;
		}

		return (
			<Box display="flex" justifyContent="center" alignItems="center" width="100%" height="300px"
				 component={Paper}>
				An error occurred. Please try again later.
				{errorMessage}
			</Box>
		);
	};

	const renderLoadingSkeleton = (): ReactNode => (
		<Box display="flex" flexDirection="column">
			<Skeleton height={50} className="mb-2" />
			<Skeleton count={10} />
		</Box>
	);

	const renderTable = (tableData: T[]): ReactNode => {
		const columnHeaders = extractor(tableData[0], 0).map(column => column.head);

		return (
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{columnHeaders.map((header) => (
								<TableCell key={header} sx={{ p: 1 }}>
									<Typography fontWeight="bold">{header}</Typography>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{tableData.map((row, rowIndex) => (
							<TableRow
								key={rowIndex}
								className="cursor-pointer hover:bg-gray-50 [&>td]:p-2"
								onClick={() => onRowClicked?.(row)}
							>
								{extractor(row, rowIndex).map((cellData, cellIndex) => (
									<TableCell key={cellIndex}>
										{cellData.value}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		);
	};

	if (error) {
		return renderError(error);
	}

	if (isLoading || !data) {
		return renderLoadingSkeleton();
	}

	const hasData = data.length > 0;
	const content = hasData ? renderTable(data) : <Typography>No entry found</Typography>;

	return wrapTable ? wrapTable(content) : <>{content}</>;
}