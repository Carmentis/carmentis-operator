'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, IconButton, Input, Spinner, Typography } from '@material-tailwind/react';
import {
	useOracleDeletion,
	useOraclePublication,
	useOracleUpdate,
} from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOracle, useOracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/data-access-layer';

import {
	OracleServiceInputFieldEditionCard,
} from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-service-input-edition-card';
import {
	OracleServiceOutputFieldEditionCard,
} from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-service-output-edition-card';
import LargeCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/large-edition-card';
import OracleStructureFieldEditionCard
	from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-structure-field-edition-card';
import InputButtonForm from '@/components/form/input-button.form';
import { MyChip } from '@/app/home/organisation/[organisationId]/application/[applicationId]/enumerations-panel';
import SmallCardEdition from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/small-edition-card';
import { EditionStatusContextProvider, useEditionStatusContext } from '@/contexts/edition-status.context';
import TabsComponent from '@/components/tabs.component';
import { OracleStoreContextProvider} from '@/contexts/oralce-store.context';
import DefaultCard from '@/components/default-card.component';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import OverviewInput from '@/components/overview-input.component';
import { OracleEnumeration, OracleMask } from '@/entities/oracle.entity';
import { OracleDataAccess } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/data-access-layer';


/**
 * Functional component representing the Oracle navigation bar.
 * This component provides the user interface to save, publish, or delete an oracle,
 * and displays oracle-specific details such as its name and version.
 *
 * @return {JSX.Element} A JSX element representing the Oracle navbar.
 */
function OracleNavbar() {
	const callOracleUpdate = useOracleUpdate();
	const router = useRouter();
	const notify = useToast();
	const oracle = useOracle();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const editionStatus = useEditionStatusContext();
	const callOracleDeletion = useOracleDeletion();
	const callOraclePublication = useOraclePublication();

	const [saving, setSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

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
				editionStatus.setIsModified(false);
			},
			onError: notify.error,
			onEnd: () => {
				setSaving(false);
			},
		});
	}

	function publish() {
		setIsPublishing(true);
		callOraclePublication(organisation.id, oracle.id, {
			onSuccess: () => {
				notify.success('Oracle published');
			},
			onError: notify.error,
			onEnd: () => setIsPublishing(false)
		})
	}

	return <Card>
		<CardBody className={'flex justify-between items-center py-4'}>
			<div id="left" className={"flex flex-row items-center"}>
				<Typography variant="h5" className={"border-r-2 mr-2 pr-2"}>{oracle.name}</Typography>
				<Typography>Version {oracle.version}</Typography>
			</div>
			<div className={"space-x-2"}>
				{editionStatus.isModified && <Button onClick={save}>
					{saving && <Spinner />}
					{!saving && <><i className={'bi bi-floppy-fill  mr-2'}></i><span>save</span></>}
				</Button>}

				{!editionStatus.isModified && oracle.isDraft && <Button onClick={publish}>
					{isPublishing && <Spinner />}
					{!isPublishing && <><i className={'bi bi-floppy-fill  mr-2'}></i><span>publish</span></>}
				</Button>}

				<IconButton variant={'gradient'} onClick={deleteOracle}>
					<TrashIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
				</IconButton>
			</div>
		</CardBody>
	</Card>;
}


/**
 * Represents the OracleOverview component which displays an editable overview of the Oracle entity.
 *
 * @return {JSX.Element} A JSX element rendering an overview card with the Oracle name input.
 */
function OracleOverview() {
	// Oracle data
	const oracle = useOracle();
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
 * A React component that displays a horizontal input field with a label and a submit button.
 * Allows the user to input a value and trigger a submission action.
 *
 * @param {Object} input - An object containing the input's configuration options.
 * @param {string} input.label - The label text for the submit button.
 * @param {function(string): void} input.onSubmit - A callback function triggered on submit, receiving the input value.
 * @return {JSX.Element} A JSX element rendering the horizontal input button component.
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
 * Renders the `ServicesPanel` component, which provides functionalities for managing services, including adding/removing services, inputs, and outputs and editing their details.
 *
 * This component retrieves the current state of services from an Oracle and uses an editor function to update or modify those services interactively.
 * The interface includes controls for adding inputs/outputs to services and dynamically displaying and editing them.
 *
 * @return {JSX.Element | Skeleton} A rendered JSX component that includes the UI for interacting with services or a skeleton loading state while data loads.
 */
function ServicesPanel() {
	const oracle = useOracle();
	const setOracle = useOracleEditor();


	function CreateService(serviceName: string) {
		setOracle(editor => {
			editor.createService(serviceName);
		});
	}

	function removeService(serviceName: string) {
		setOracle(editor => {
			editor.deleteServiceByName(serviceName);
		});
	}

	function addInput(serviceName: string, name: string) {
		setOracle(editor => {
			const response = editor.createServiceInput(serviceName, name);
			console.log('Response of addInput:', response);
		});
	}

	function removeServiceInput(serviceName: string, name: string) {
		console.log('Remove serviceInput', serviceName, name);
		setOracle(editor => {
			editor.deleteServiceInputByName(serviceName, name);
		});
	}


	function addOutput(serviceName: string, name: string) {
		setOracle(editor => {
			editor.createServiceOutput(serviceName, name);
		});
	}

	function removeOutput(serviceName: string, name: string) {
		setOracle(editor => {
			editor.deleteServiceOutputByName(serviceName, name);
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
					onRemove={() => removeService(s.name)}>
					<Input variant={'outlined'} size={'md'} label={'Name'} value={s.name} />

					{/* Inputs of the service */}
					<Typography variant={'h6'}>Inputs</Typography>
					<HorizontalInputButton
						label={'Add input'}
						onSubmit={(val) => addInput(s.name, val)}
					/>

					<div className="flex flex-wrap gap-4">
						{
							s.request.map((i, index) =>
								<OracleServiceInputFieldEditionCard
									key={index}
									field={i}
									serviceName={s.name}
									onRemoveField={() => removeServiceInput(s.name, i.name)} />,
							)
						}
					</div>


					{/* Outputs of the service */}
					<Typography variant={'h6'}>Outputs</Typography>
					<HorizontalInputButton
						label={'Add output'}
						onSubmit={(val) => addOutput(s.name, val)}
					/>

					<div className="flex flex-wrap gap-4">
						{
							s.answer.map((o, index) =>
								<OracleServiceOutputFieldEditionCard
									key={index}
									field={o}
									serviceName={s.name}
									onRemoveField={() => removeOutput(s.name, o.name)} />,
							)
						}
					</div>
				</LargeCardEdition>;
			})
		}


	</>;
}


/**
 * StructurePanel is a React component that allows users to manage and edit structures and their associated fields.
 * It provides functionality to add new structures, remove existing structures, and edit their properties through intuitive UI elements.
 *
 * @return {JSX.Element} The rendered component, including UI elements for creating and managing structures,
 *                        as well as their associated fields.
 */
function StructurePanel() {
	const oracle = useOracle();
	const editOracle = useOracleEditor();

	function CreateStructure(name: string) {
		if (name === '') return;
		editOracle(e => e.createStructure(name));
	}

	return <>
		{/* Service */}
		<HorizontalInputButton label={'add structure'} onSubmit={(v: string) => CreateStructure(v)} />

		{
			oracle.data.structures && oracle.data.structures.map((s, index) =>
				<LargeCardEdition
					name={s.name}
					key={index}
					onRemove={() => {
						editOracle(e => e.deleteStructureByName(s.name));
					}}>

					<HorizontalInputButton
						label={'add property'}
						onSubmit={v => editOracle(e => e.createStructureField(s.name, v))}
					/>

					<div className="flex flex-wrap gap-4">
						{
							s.properties.map((f, index) =>
								<OracleStructureFieldEditionCard
									key={index}
									structureName={s.name}
									field={f}
									onRemoveField={() => {
										editOracle(e => e.deleteStructureFieldByName(s.name, f.name));
									}} />,
							)
						}
					</div>
				</LargeCardEdition>)
		}
	</>;
}


/**
 * Renders the EnumerationsPanel component. It displays a list of enumerations and provides
 * functionalities to add, edit, or delete enumerations and their associated values.
 *
 * @return {JSX.Element} The rendered JSX for the EnumerationsPanel component.
 */
function EnumerationsPanel() {
	const oracle = useOracle();
	const editOracle = useOracleEditor();


	function EnumerationEdition(
		input: { enumeration: OracleEnumeration },
	) {
		const e = input.enumeration;
		return <>
			<InputButtonForm
				inputLabel={'Name'}
				buttonLabel={'Add value'}
				onConfirm={v =>
					editOracle(ed => ed.addEnumerationValue(e.name, v))
				} />;

			<div className="values flex flex-wrap gap-2">
				{
					e.values.map((v, index) => {
						return <MyChip
							key={index}
							enumId={v}
							enumValue={v}
							removeEnumValue={v =>
								editOracle(ed => ed.removeEnumerationValue(e.name, v))
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
			onSubmit={v => editOracle(e => e.createEnumeration(v))} />

		{
			oracle.data.enumerations && oracle.data.enumerations.map((e, index) =>
				<LargeCardEdition
					key={index}
					name={e.name}
					onRemove={() =>
						editOracle(ed => ed.deleteEnumerationByName(e.name))
					}>
					<EnumerationEdition enumeration={e} />
				</LargeCardEdition>,
			)
		}
	</>;
}

/**
 * Represents a component that allows the user to edit the properties of an OracleMask object.
 *
 * @param {Object} input An object containing the required input parameters.
 * @param {OracleMask} input.mask The mask object containing initial values for `name`, `regex`, and `substitution`.
 *
 * @return {JSX.Element} A JSX element rendering the mask editing interface, including inputs for name, expression, and substitution.
 */
function MaskEditionCard(
	input: { mask: OracleMask },
) {
	const setOracle = useOracleEditor();
	const mask = input.mask;
	const [name, setName] = useState(mask.name);
	const [expression, setExpression] = useState(mask.regex);
	const [substitution, setSubstitution] = useState(mask.substitution);

	useEffect(() => {
		setOracle(e => e.updateMaskByName(mask.name, {
			name,
			regex: expression,
			substitution,
		}));
	}, [name, expression, substitution]);

	return <SmallCardEdition
		name={mask.name}
		onRemove={() => {
			setOracle(e => e.deleteMaskByName(mask.name));
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

/**
 * MasksPanel is a React functional component that provides a user interface for managing and editing masks.
 * It includes a form to add a new mask and displays a list of existing masks with editing options.
 *
 * @return {JSX.Element} A JSX element representing the masks management panel with input form and mask cards.
 */
function MasksPanel() {
	const oracle = useOracle();
	const setOracle = useOracleEditor();


	return <>
		<InputButtonForm
			inputLabel={'Name'}
			buttonLabel={'Add Mask'}
			onConfirm={v => setOracle(e => e.createMask(v))}
		/>

		<div className="flex flex-wrap gap-4">
			{
				oracle.data.masks && oracle.data.masks.map((mask, index) => {
					return <MaskEditionCard
						mask={mask}
						key={index}
					/>;
				})
			}
		</div>
	</>;
}


/**
 * A React functional component that renders a formatted JSON representation of data
 * obtained from an Oracle object.
 *
 * @return {React.Element} A React element containing a `<pre>` tag with JSON-formatted Oracle data.
 */
function CodeViewPanel(
) {
	const oracle = useOracle();

	return <>
		<pre>

			{JSON.stringify(oracle.data, null, 2)}
		</pre>
	</>;
}

/**
 * OracleEditionPanel is a function component that renders a default card containing a tabs component.
 * The tabs component includes multiple panels for navigating through different sections such as
 * Services, Structures, Enumerations, Masks, and Code View.
 *
 * @return {JSX.Element} A DefaultCard component containing TabsComponent with defined panels.
 */
function OracleEditionPanel() {
	return <DefaultCard>
		<TabsComponent
			defaultTabValue={'Services'}
			panels={{
				'Services': <ServicesPanel />,
				'Structures': <StructurePanel />,
				'Enumerations': <EnumerationsPanel />,
				'Masks': <MasksPanel />,
				'Code View': <CodeViewPanel/>
			}} />
	</DefaultCard>;
}



/**
 * OraclePage is a React component that renders the Oracle Store Context Provider,
 * Edition Status Context Provider, and Oracle Data Access component. This component
 * includes the OracleNavbar, OracleOverview, and OracleEditionPanel to provide the
 * necessary structure and functionality for Oracle-related data and actions.
 *
 * @return {JSX.Element} The rendered OraclePage component containing all nested child components.
 */
export default function OraclePage() {
	return <OracleStoreContextProvider>
		<EditionStatusContextProvider>
			<OracleDataAccess>
				<div className={'mb-8'}>
					<OracleNavbar />
				</div>

				<div className="mb-8">
					<OracleOverview />
				</div>
				<OracleEditionPanel />
			</OracleDataAccess>
		</EditionStatusContextProvider>
	</OracleStoreContextProvider>;

}