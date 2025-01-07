'use client';

import { useParams, useRouter } from 'next/navigation';
import {
	Button,
	Card,
	CardBody, CardHeader,
	IconButton,
	Input, Spinner, Tab,
	TabPanel,
	Tabs, TabsBody,
	TabsHeader,
	Typography,
} from '@material-tailwind/react';
import {
	OracleInOrganisation,
	useFetchFullOracleInOrganisation,
	useOracleDeletion,
	useOracleUpdate,
} from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { TrashIcon } from '@heroicons/react/16/solid';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import {
	ApplicationContext, EditionStatusContext,
	OverviewInput,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import { OracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-editor';
import OracleServiceFieldEditionCard
	from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-edition-cards';

function OracleNavbar() {
	const callOracleUpdate = useOracleUpdate();
	const params = useParams();
	const organisationId = parseInt(params.organisationId);
	const router = useRouter();
	const notify = useToast();
	const oracle = useOracle();
	const isModified = useOracleEditionStatus();
	const [saving, setSaving] = useState<boolean>(false);
	const context = useContext(OracleEditionStatusContext);

	/**
	 *
	 */
	function deleteOracle() {
		const callOracleDeletion = useOracleDeletion();
		callOracleDeletion(organisationId, oracle.id, {
			onSuccess: () => {
				notify.info('Oracle deleted');
				router.push(`/home/organisation/${organisationId}/oracle`);
			},
			onError: notify.error,
		});
	}

	function save() {
		setSaving(true)
		callOracleUpdate(organisationId, oracle, {
			onSuccess: () => {
				notify.info('Oracle saved');
				context.setIsModified(false)
			},
			onError: notify.error,
			onEnd: () => {
				setSaving(false)
			}
		})
	}

	return <Card>
		<CardBody className={'flex justify-between items-center'}>
			<Typography variant="h5">Oracle {oracle.name}</Typography>
			<div>
				<IconButton  hidden={!isModified} onClick={save}>
					{ saving && <Spinner /> }
					{ !saving && <i className={"bi bi-floppy-fill"}></i>}
				</IconButton>
				<IconButton variant={'gradient'} onClick={deleteOracle}>
					<TrashIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
				</IconButton>
			</div>
		</CardBody>
	</Card>;
}


function OracleOverview(
	input: {
		oracle: OracleInOrganisation
	},
) {
	const oracle = input.oracle;
	const [name, setName] = useState(oracle.name);

	return <Card>
		<CardBody>

			<Typography variant="h5" className={'mb-4'}>Overview</Typography>

			<OverviewInput
				label={'Oracle name'}
				value={name}
				onChange={setName}
			/>
		</CardBody>
	</Card>;
}


function HorizontalInputButton(
	input : {
		label: string;
		onSubmit: (value: string) => void
	}
) {


	const [value, setValue] = useState('');
	function submitValue() {
		const res = value;
		setValue("");
		input.onSubmit(res);
	}
	return <div  className={'flex flex-row p-1 gap-2 mt-4 mb-4'}>
		<div className="w-64">
			<Input label={'name'}
				   value={value}
				   onChange={e => setValue(e.target.value)}
				   className={'w-14'} />
		</div>
		<Button size={'md'} onClick={submitValue}>{input.label}</Button>
	</div>;
}

function ServicesPanel() {
	const oracle = useOracle();
	const setOracle = useSetOracle();


	function CreateService(serviceName: string) {
		setOracle(editor => {
			editor.createService(serviceName);
		});
	}

	function removeService(serviceId: number) {
		setOracle(editor => {
			editor.deleteServiceById(serviceId);
		});
	}

	function addInput( serviceId: number, name: string ) {
		setOracle(editor => {
			editor.createServiceInput(serviceId, name);
		})
	}

	function removeServiceInput( serviceId: number, inputId: number ) {
		setOracle(editor => {
			editor.deleteServiceInputById(serviceId, inputId);
		})
	}


	function addOutput( serviceId: number, name: string ) {
		setOracle(editor => {
			editor.createServiceOutput(serviceId, name);
		})
	}

	function removeOutput( serviceId: number, outputId: number ) {
		setOracle(editor => {
			editor.deleteServiceOutputById(serviceId, outputId);
		})
	}

	if (!oracle) return <Skeleton count={2} />;

	return <>
		{/* Service */}
		<HorizontalInputButton label={'add service'} onSubmit={(v:string) => CreateService(v)}/>


		{
			oracle.data.services?.map((s,index) => {
				return <Card key={index} className={'border-2 border-gray-800 w-full'}>
					<CardHeader floated={false}
								shadow={false}
								color="transparent"
								className="m-0 rounded-none rounded-t-md p-2 bg-gray-800 flex justify-between">

						<Typography variant={'h6'} color={'white'}>{s.name}</Typography>
						<IconButton variant={'filled'} color={'white'} size={'sm'}
									onClick={() => removeService(s.id)}
						>
							<i className="bi bi-trash" />
						</IconButton>
					</CardHeader>
					<CardBody className={'flex flex-col space-y-4'}>
						<Input variant={'outlined'} size={'md'} label={'Name'} value={s.name} />

						{/* Inputs of the service */}
						<Typography variant={'h6'}>Inputs</Typography>
						<HorizontalInputButton
							label={'Add input'}
							onSubmit={(val) => addInput(s.id, val)}
						/>

						<div className="flex flex-wrap gap-4">
							{
								s.inputs.map((i, index) => <Card key={index} className={'border-2 border-gray-800'}>
									<OracleServiceFieldEditionCard
										field={i}
										serviceId={s.id}
										fieldType={'input'}
										onRemoveField={() => removeServiceInput(s.id, i.id)} />
								</Card>)
							}
						</div>


						{/* Outputs of the service */}
						<Typography variant={'h6'}>Outputs</Typography>
						<HorizontalInputButton
							label={'Add output'}
							onSubmit={(val) => addOutput(s.id, val)}
						/>

						<div className="flex flex-wrap gap-4">
							{
								s.outputs.map((o, index) => <Card key={index} className={'border-2 border-gray-800'}>
									<OracleServiceFieldEditionCard
										field={o}
										serviceId={s.id}
										fieldType={'output'}
										onRemoveField={() => removeOutput(s.id, o.id)} />
								</Card>)
							}
						</div>
					</CardBody>
				</Card>;
			})
		}


	</>;
}


function OracleEditionPanel() {
	return <Card>
		<CardBody>

			<Tabs value={'services'}>
				<TabsHeader
					className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
					indicatorProps={{
						className:
							'bg-transparent border-b-2 border-gray-900 shadow-none rounded-none',
					}}
				>
					<Tab key={'services'} value={'services'}>Services</Tab>
					<Tab key={'structures'} value={'structures'}>Structures</Tab>
					<Tab key={'enumerations'} value={'enumerations'}>Enumerations</Tab>
					<Tab key={'masks'} value={'masks'}>Mask</Tab>
				</TabsHeader>
				<TabsBody>
					<TabPanel key={'services'} value={'services'}>
						<ServicesPanel />
					</TabPanel>
				</TabsBody>
			</Tabs>

		</CardBody>
	</Card>;
}


export interface OracleState {
	oracle: OracleInOrganisation;
	setOracle: Dispatch<SetStateAction<OracleInOrganisation>>
}

export interface OracleEditionStatus {
	isModified: boolean,
	setIsModified: Dispatch<SetStateAction<boolean>>
}

export const OracleContext = createContext<OracleState>();
export const OracleEditionStatusContext = createContext<OracleEditionStatus>();


export const useOracle = () => {
	const context = useContext(OracleContext);
	return context.oracle;
}

export const useOracleEditionStatus = () => {
	const context = useContext(OracleEditionStatusContext);
	return context.isModified;
}

export const useSetOracle = () => {
	const statusContext = useContext(OracleEditionStatusContext);
	const context = useContext(OracleContext);
	return (cb: (editor: OracleEditor) => void) => {
		statusContext.setIsModified(true);
		context.setOracle(oracle => {
			const editor = new OracleEditor(oracle);
			cb(editor)
			return {... oracle}
		})
	}
};



export default function OraclePage() {

	// load parameters
	const params = useParams();
	const organisationId = parseInt(params.organisationId);
	const oracleId = parseInt(params.oracleId);


	// load the oracle from the API
	const response = useFetchFullOracleInOrganisation(organisationId, oracleId);
	const data = response.data;
	const isLoading = response.isLoading;

	// define edition state (useful to synchronize the edition status)
	const [isModified, setIsModified] = useState(false);
	const [oracle, setOracle] = useState<OracleInOrganisation>(data);
	useEffect(() => {
		setOracle(data);
	}, [data]);

	// display the loading page while the request is loading
	if (!data || !oracle || isLoading) return <Skeleton count={3} />;


	return <>
		<OracleContext.Provider value={{
			oracle: oracle,
			setOracle: setOracle,
		}}>
			<OracleEditionStatusContext.Provider value={{
				isModified,
				setIsModified
			}}>
			<div className={'mb-8'}>
				<OracleNavbar oracle={data} />
			</div>
			<div className="mb-8">
				<OracleOverview oracle={data} />
			</div>
			<OracleEditionPanel />
			</OracleEditionStatusContext.Provider>
		</OracleContext.Provider>
	</>;
}