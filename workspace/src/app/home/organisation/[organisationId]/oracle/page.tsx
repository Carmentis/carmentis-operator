'use client';

import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { useState } from 'react';
import {
	IdentifiedEntity,
	useFetchOraclesInOrganisation,
	useOracleCreation,
} from '@/components/api.hook';
import { useParams, useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import { useToast } from '@/app/layout';
import Avatar from 'boring-avatars';
import Link from 'next/link';


export default function OraclePage() {


	const params = useParams();
	const router = useRouter();
	const organisationId = parseInt(params.organisationId);
	const notify = useToast();
	const { data, isLoading } = useFetchOraclesInOrganisation(organisationId);
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


	return <>
		{/* Search card */}
		<Card className={"mb-8"}>
			<CardBody>
				<div className="header flex justify-between">
					<Typography variant={'h5'}>Oracles</Typography>
					<div className="flex space-x-2 mb-4">
						<Button  onClick={() => setShowOracleCreationModal(true)}>Create oracle</Button>
						<Button disabled>Import oracle</Button>
					</div>
				</div>
				<SearchInputForm searchFilter={searchInput} setSearchFilter={setSearchInput} />
			</CardBody>
		</Card>


		{/* Oracles */}
		<div className={"flex flex-wrap gap-4"}>
			{
				data
					.filter(oracle => searchInput === '' || oracle.name.toLowerCase().includes(searchInput.toLowerCase()))
					.map((oracle, index) =><Link key={index} href={`oracle/${oracle.id}`}>
						<Card className={"w-52"} >
							<CardBody
								className={"w-full flex flex-col justify-center items-center text-center"}>
								<Avatar name={oracle.name} variant={"sunset"} width={54} className={"mb-4"}/>
								{oracle.name}
							</CardBody>
						</Card>
					</Link>)
			}
		</div>


		{
			showOracleCreationModal &&
			<SimpleTextModalComponent label={'Oracle name'}
									  onSubmit={CreateOracle}
									  onClose={() => {
										  setShowOracleCreationModal(false);
									  }}
									  placeholder={'Name'} />
		}

	</>;
}