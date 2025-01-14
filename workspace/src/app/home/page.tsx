'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Organisation } from '@/components/sidebar';
import { fetchOrganisationsOfUser, useOrganisationCreation } from '@/components/api.hook';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import { useRouter } from 'next/navigation';
import Avatar from 'boring-avatars';
import { Button } from '@material-tailwind/react';
import DefaultCard from '@/components/default-card.component';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';

function OrganisationCard(input: { organisation: { id:number, name: string } }) {
	return <Link className={'card w-52 flex flex-col justify-center items-center space-y-2 h-52 hover:cursor-pointer'}
				 href={`/home/organisation/${input.organisation.id}`}>
			<Avatar name={input.organisation.name} variant={"beam"} width={60} height={60} />
		<p className={'organisation-name'}>{input.organisation.name}</p>
	</Link>;
}


function AdministrationPanelAccess() {
	const navigation = useApplicationNavigationContext();
	return <div className={"absolute left-5 top-5 w-72"}>
		<DefaultCard bodyClassName={"p-4 flex flex-col items-center"}>
			Are you an Administrator ?
			<Button onClick={navigation.navigateToAdmin}>move to administration page</Button>
		</DefaultCard>
	</div>
}

export default function HomePage() {
	const [search, setSearch] = useState('');
	const [showNewOrganisationModal, setShowNewOrganisationModal] = useState(false);

	const [organisations, setOrganisations] = useState<Organisation[]>([]);
	const {data, loading, error} = fetchOrganisationsOfUser();
	const callOrganisationCreation = useOrganisationCreation();
	const router = useRouter();

	useEffect(() => {
		if (data) {
			setOrganisations(data);
		}
	},[data])


	function createOrganisation(organisationName: string) {
		setShowNewOrganisationModal(false);
		callOrganisationCreation(organisationName, {
			onSuccessData: (data: {id: number}) => {
				router.push(`/home/organisation/${data.id}`);
			}
		})
	}




	return <section className="bg-gray-50 dark:bg-gray-900 p-8 h-screen ">
		<AdministrationPanelAccess/>
		<div id="filter" className={'flex flex-col space-y-4 w-100 justify-center items-center mb-8'}>
			<Image src={'/logo-full.svg'} alt={'logo'} width={120} height={120} />
			<div className="relative z-0 w-3/12 mb-5 ">
				<input type="text" name="filter"
					   className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
					   placeholder=" " required onChange={event => setSearch(event.target.value)} />
				<label htmlFor="floating_email"
					   className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
					Search
				</label>
			</div>
		</div>

		<div
			className="flex flex-row items-center justify-center px-6 py-4 mx-auto  lg:py-0 gap-2 flex-wrap w-8/12">
			<div
				onClick={() => setShowNewOrganisationModal(true)}
				className={'card w-52 flex flex-col justify-center items-center space-y-2 h-52 bg-opacity-15 bg-primary-light border-primary-light hover:cursor-pointer border-dashed'}>
				<div className="organisation-logo h-24 w-24 rounded-full flex justify-center items-center">
					<i className={'bi bi-plus'}></i>
				</div>
			</div>
			{
				organisations
					.filter((organisation) => search === '' || organisation.name.toLowerCase().includes(search.toLowerCase()))
					.map((organisation, index) => <OrganisationCard key={index} organisation={organisation} />)
			}

		</div>

		{
			showNewOrganisationModal &&
			<SimpleTextModalComponent label={"Organisation Name"}
									  onSubmit={createOrganisation}
									  onClose={() => setShowNewOrganisationModal(false)}
									  placeholder={"Name"}/>
		}
	</section>;
}