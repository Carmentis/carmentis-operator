'use client';

import { useParams, useRouter } from 'next/navigation';
import {
	Button,
	Card,
	CardBody, CardHeader, Checkbox,
	IconButton,
	Input, Option, Radio, Select, Spinner, Tab,
	TabPanel,
	Tabs, TabsBody,
	TabsHeader,
	Typography,
} from '@material-tailwind/react';
import {
	OracleEnumeration,
	OracleInOrganisation, OracleMask,
	useFetchFullOracleInOrganisation,
	useOracleDeletion,
	useOracleUpdate,
} from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { TrashIcon } from '@heroicons/react/16/solid';
import { createContext, Dispatch, SetStateAction, use, useContext, useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import {
	OverviewInput,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import { OracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-editor';
import {
	OracleServiceInputFieldEditionCard,
} from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-service-input-edition-card';
import {
	OracleServiceOutputFieldEditionCard,
} from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-service-output-edition-card';
import { FieldVisility } from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import LargeCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/large-edition-card';
import OracleStructureFieldEditionCard
	from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-structure-field-edition-card';
import InputButtonForm from '@/components/form/input-button.form';
import { MyChip } from '@/app/home/organisation/[organisationId]/application/[applicationId]/enumerations-panel';
import SmallCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/small-edition-card';

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
	const callOracleDeletion = useOracleDeletion();

	/**
	 * Delete the oracle.
	 */
	function deleteOracle() {
		callOracleDeletion(organisationId, oracle.id, {
			onSuccess: () => {
				notify.info('Oracle deleted');
				router.push(`/home/organisation/${organisationId}/oracle`);
			},
			onError: notify.error,
		});
	}

	/**
	 * Save the oracle.
	 */
	function save() {
		setSaving(true);
		callOracleUpdate(organisationId, oracle, {
			onSuccess: () => {
				notify.info('Oracle saved');
				context.setIsModified(false);
			},
			onError: notify.error,
			onEnd: () => {
				setSaving(false);
			},
		});
	}

	return <Card>
		<CardBody className={'flex justify-between items-center'}>
			<Typography variant="h5">Oracle {oracle.name}</Typography>
			<div>
				<IconButton hidden={!isModified} onClick={save}>
					{saving && <Spinner />}
					{!saving && <i className={'bi bi-floppy-fill'}></i>}
				</IconButton>
				<IconButton variant={'gradient'} onClick={deleteOracle}>
					<TrashIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
				</IconButton>
			</div>
		</CardBody>
	</Card>;
}


/**
 * Display the overview of the oracle.
 * @param input - The input data.
 * @constructor
 */
function OracleOverview(
	input: {
		oracle: OracleInOrganisation
	},
) {
	// Oracle data
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


/**
 * Display a horizontal input button.
 * @param input - The input data.
 * @constructor
 */
function HorizontalInputButton(
	input: {
		label: string;
		onSubmit: (value: string) => void
	},
) {


	const [value, setValue] = useState('');

	function submitValue() {
		const res = value;
		setValue('');
		input.onSubmit(res);
	}

	return <div className={'flex flex-row p-1 gap-2 mt-4 mb-4'}>
		<div className="w-64">
			<Input label={'name'}
				   value={value}
				   onChange={e => setValue(e.target.value)}
				   className={'w-14'} />
		</div>
		<Button size={'md'} onClick={submitValue}>{input.label}</Button>
	</div>;
}

/**
 * Display the services panel.
 * @constructor
 */
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

	function addInput(serviceId: number, name: string) {
		setOracle(editor => {
			const response = editor.createServiceInput(serviceId, name);
			console.log('Response of addInput:', response);
		});
	}

	function removeServiceInput(serviceId: number, inputId: number) {
		console.log('Remove serviceInput', serviceId, inputId);
		setOracle(editor => {
			editor.deleteServiceInputById(serviceId, inputId);
		});
	}


	function addOutput(serviceId: number, name: string) {
		setOracle(editor => {
			editor.createServiceOutput(serviceId, name);
		});
	}

	function removeOutput(serviceId: number, outputId: number) {
		setOracle(editor => {
			editor.deleteServiceOutputById(serviceId, outputId);
		});
	}

	if (!oracle) return <Skeleton count={2} />;


	return <>
		{/* Service */}
		<HorizontalInputButton label={'add service'} onSubmit={(v: string) => CreateService(v)} />


		{
			oracle.data.services?.map((s, index) => {
				return <LargeCardEdition
					key={index}
					name={s.name}
					onRemove={() => removeService(s.id)}>
					<Input variant={'outlined'} size={'md'} label={'Name'} value={s.name} />

					{/* Inputs of the service */}
					<Typography variant={'h6'}>Inputs</Typography>
					<HorizontalInputButton
						label={'Add input'}
						onSubmit={(val) => addInput(s.id, val)}
					/>

					<div className="flex flex-wrap gap-4">
						{
							s.inputs.map((i, index) =>
								<OracleServiceInputFieldEditionCard
									key={index}
									field={i}
									serviceId={s.id}
									onRemoveField={() => removeServiceInput(s.id, i.id)} />,
							)
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
							s.outputs.map((o, index) =>
								<OracleServiceOutputFieldEditionCard
									key={index}
									field={o}
									serviceId={s.id}
									onRemoveField={() => removeOutput(s.id, o.id)} />
							)
						}
					</div>
				</LargeCardEdition>;
			})
		}


	</>;
}


/**
 * Structure panel.
 * @constructor
 */
function StructurePanel() {
	const oracle = useOracle();
	const setOracle = useSetOracle();

	function CreateStructure(name: string) {
		if (name === '') return;
		setOracle(e => e.createStructure(name));
	}

	return <>
		{/* Service */}
		<HorizontalInputButton label={'add structure'} onSubmit={(v: string) => CreateStructure(v)} />

		{
			oracle.data.structures.map((s, index) =>
				<LargeCardEdition
					name={s.name}
					key={index}
					onRemove={() => {
						setOracle(e => e.deleteStructureById(s.id));
					}}>

					<HorizontalInputButton
						label={'add property'}
						onSubmit={v => setOracle(e => e.createStructureField(s.id, v))}
					/>

					{
						s.fields.map((f, index) =>
							<OracleStructureFieldEditionCard
								key={index}
								structureId={s.id}
								field={f}
								onRemoveField={() => {
									setOracle(e => e.deleteStructureFieldById(s.id, f.id));
								}} />,
						)
					}
				</LargeCardEdition>)
		}
	</>;
}


function EnumerationsPanel() {
	const oracle = useOracle();
	const setOracle = useSetOracle();


	function EnumerationEdition(
		input: { enumeration: OracleEnumeration },
	) {
		const e = input.enumeration;
		return <>
			<InputButtonForm
				inputLabel={'Name'}
				buttonLabel={'Add value'}
				onConfirm={v =>
					setOracle(ed => ed.addEnumerationValue(e.id, v))
				} />;

			<div className="values flex flex-wrap gap-2">
				{
					e.values.map((v, index) => {
						return <MyChip
							key={index}
							enumId={v}
							enumValue={v}
							removeEnumValue={v =>
								setOracle(ed => ed.removeEnumerationValue(e.id, v))
							}
						></MyChip>;
					})
				}
			</div>
		</>;
	}

	return <>
		<HorizontalInputButton
			label={'Add enumeration'}
			onSubmit={v => setOracle(e => e.createEnumeration(v))} />

		{
			oracle.data.enumerations.map((e, index) =>
				<LargeCardEdition
					key={index}
					name={e.name}
					onRemove={() =>
						setOracle(ed => ed.deleteEnumerationById(e.id))
					}>
					<EnumerationEdition enumeration={e} />
				</LargeCardEdition>,
			)
		}
	</>;
}

function MaskEditionCard(
	input: { mask: OracleMask },
) {
	const setOracle = useSetOracle();
	const mask = input.mask;
	const [name, setName] = useState(mask.name);
	const [expression, setExpression] = useState(mask.expression);
	const [substitution, setSubstitution] = useState(mask.substitution);

	useEffect(() => {
		setOracle(e => e.updateMask({
			id: mask.id,
			name,
			expression,
			substitution,
		}))
	}, [name, expression, substitution]);

	return <SmallCardEdition
		name={mask.name}
		onRemove={() => {
			setOracle(e => e.deleteMaskById(mask.id));
		}}>
		<Input variant={'outlined'} size={'md'} label={'Name'}
			   value={name} onChange={(event) => {
			setName(event.target.value);

		}} />
		<Input variant={'outlined'} size={'md'} label={'Expression'}
			   value={expression} onChange={(event) => {
			setExpression(event.target.value);

		}} />
		<Input variant={'outlined'} size={'md'} label={'Subsitution'}
			   value={substitution} onChange={(event) => {
			setSubstitution(event.target.value);

		}} />
	</SmallCardEdition>;
}

function MasksPanel() {
	const oracle = useOracle();
	const setOracle = useSetOracle();



	return <>
		<InputButtonForm
			inputLabel={'Name'}
			buttonLabel={'Add Mask'}
			onConfirm={v => setOracle(e => e.createMask(v))}
		/>

		<div className="flex flex-wrap gap-4">
			{
				oracle.data.masks.map((mask, index) => {
					return <MaskEditionCard
						mask={mask}
						key={index}
					/>;
				})
			}
		</div>
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
					<TabPanel key={'structures'} value={'structures'}>
						<StructurePanel />
					</TabPanel>
					<TabPanel key={'enumerations'} value={'enumerations'}>
						<EnumerationsPanel />
					</TabPanel>
					<TabPanel key={'masks'} value={'masks'}>
						<MasksPanel />
					</TabPanel>
				</TabsBody>
			</Tabs>

		</CardBody>
	</Card>;
}


export interface OracleState {
	oracle: OracleInOrganisation;
	setOracle: Dispatch<SetStateAction<OracleInOrganisation>>;
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
};

export const useOracleEditionStatus = () => {
	const context = useContext(OracleEditionStatusContext);
	return context.isModified;
};

export const useSetOracle = () => {
	const statusContext = useContext(OracleEditionStatusContext);
	const context = useContext(OracleContext);
	return (cb: (editor: OracleEditor) => void) => {
		statusContext.setIsModified(true);
		context.setOracle(oracle => {
			const editor = new OracleEditor(oracle);
			cb(editor);
			return { ...oracle };
		});
	};
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
				setIsModified,
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