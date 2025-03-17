'use client';

import { Button, Card, CardBody, Chip, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { useState } from 'react';
import { IdentifiedEntity, useFetchOraclesSummaryInOrganisation, useOracleCreation } from '@/components/api.hook';
import { useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import CardTableComponent from '@/components/card-table.component';
import { OracleSummary } from '@/entities/oracle.entity';
import { Container } from '@mui/material';
import { useCustomRouter } from '@/contexts/application-navigation.context';


export default function OraclePage() {

	const router = useCustomRouter();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const notify = useToast();
	const { data, isLoading } = useFetchOraclesSummaryInOrganisation(organisationId);
	const [searchInput, setSearchInput] = useState('');
	const [showOracleCreationModal, setShowOracleCreationModal] = useState(false);


	function CreateOracle(name: string) {
		const callOracleCreation = useOracleCreation();
		callOracleCreation(organisationId, name, {
			onSuccessData: (entity: IdentifiedEntity) => {
				notify.info('Oracle created');
				router.push(`/home/organisation/${organisationId}/oracle/${entity.id}`);
			},
			onError: notify.error,
		});
	}


	if (!data || isLoading) return <Skeleton count={2} />;
	let oracleCreationModal = <></>;
	if (showOracleCreationModal) {
		oracleCreationModal = <SimpleTextModalComponent label={'Oracle name'}
														onSubmit={CreateOracle}
														onClose={() => {
															setShowOracleCreationModal(false);
														}}
														placeholder={'Name'}
		/>
	}


	return <Container className={"space-y-4"}>
		<Card>
			<CardBody>
				<div className="header flex justify-between">
					<Typography variant={'h5'}>Oracles</Typography>
					<div className="flex space-x-2 mb-4">
						<Button onClick={() => setShowOracleCreationModal(true)}>Create oracle</Button>
						<Button disabled>Import oracle</Button>
					</div>
				</div>
				<SearchInputForm searchFilter={searchInput} setSearchFilter={setSearchInput} />
			</CardBody>
		</Card>


		<OracleSummaryTable
			data={
				data.filter(
					oracle => searchInput === '' ||
						oracle.name.toLowerCase().includes(searchInput.toLowerCase()),
				)
			}
		/>

		{oracleCreationModal}
	</Container>;
}


function OracleSummaryTable(
	{ data }: { data: OracleSummary[] },
) {
	const router = useCustomRouter();

	function visiteOracle(oracleId: number) {
		router.push(`oracle/${oracleId}`);
	}

	return <CardTableComponent
		data={data}
		onRowClicked={(oracle) => visiteOracle(oracle.id)}
		extractor={(v, i) => [
			{ head: 'Name', value: <Typography>{v.name}</Typography> },
			{ head: 'Draft', value: v.isDraft && <Chip value={'Draft'} className={'bg-primary-light w-min'} /> },
			{
				head: 'Published',
				value: v.published && <Chip value={'Published'} className={'bg-primary-light w-min'} />,
			},
			{
				head: 'Published at',
				value: v.publishedAt && <Typography>{new Date(v.publishedAt).toLocaleString()}</Typography>,
			},
			{ head: 'Version', value: <Typography>{v.version}</Typography> },
		]}
	/>;
}