'use client';

import { Button, ButtonGroup, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { useState } from 'react';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import { useApplicationCreation } from '@/components/api.hook';
import { useParams } from 'next/navigation';

export default function ListOfApplicationsPage() {
	const [search, setSearch] = useState('');
	const [isShowingNameForm, setIsShowingNameForm] = useState(false);
	const createApplication = useApplicationCreation();
	const params: { organisationId: number } = useParams();



	function submitApplicationNameCreation( name: string ) {
		createApplication( params.organisationId, name, {
			onSuccessData: (data) => {
				console.log(data)
			},
			onError: (error) => {console.error(error)}
		} )
		setIsShowingNameForm(false);
	}

	return <div className={"space-y-12"}>
		<Card>
			<CardBody className={"p-3"}>
				<div className="flex justify-between">
						<Typography variant={'h5'} color={'blue-gray'} className={"justify-center items-center content-center ml-4"}>
							Applications
						</Typography>

					<div className={"space-x-2"}>
						<Button onClick={() => setIsShowingNameForm(true)}>Create application</Button>
						<Button disabled={true}>Import application</Button>
					</div>
				</div>
			</CardBody>
		</Card>

		<Card>
			<CardBody>
				<Typography variant={'h5'} color={'blue-gray'}  className={'mb-4'}>
					Search an application
				</Typography>
				<SearchInputForm searchFilter={search} setSearchFilter={setSearch}/>
			</CardBody>
		</Card>
		{
			isShowingNameForm &&
			<SimpleTextModalComponent label={"Application name"}
									  onSubmit={submitApplicationNameCreation}
									  onClose={() => {setIsShowingNameForm(false)}}
									  placeholder={"Name"} />
		}
	</div>;
}