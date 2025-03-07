'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardBody, IconButton, Spinner, Typography } from '@material-tailwind/react';
import {
	useFetchOracleInOrganisation,
	useOracleDeletion,
	useOraclePublication,
	useOracleUpdate,
} from '@/components/api.hook';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import TabsComponent from '@/components/tabs.component';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import { useAtom, useAtomValue } from 'jotai/index';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import {
	oracleAtom,
	oracleIsModifiedAtom,
	referenceOracleAtom,
} from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';
import ServicesPanel from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/services-panel';
import { Box, TextField } from '@mui/material';
import { useUpdateOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atom-logic';
import { useSetAtom } from 'jotai';
import CodeViewPanel from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/code-panel';
import StructurePanel from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/structure-panel';
import EnumerationsPanel from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/enumeration-panel';
import MasksPanel from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/masks-panel';
import ErrorsPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/errors-panel';
import { useConfirmationModal } from '@/contexts/popup-modal.component';
import EntityStatusHeader from '@/components/application-oracle-header';
import Skeleton from 'react-loading-skeleton';


export default function OraclePage() {
	const [oracle, setOracle] = useAtom(oracleAtom);
	const setReferenceOracle = useSetAtom(referenceOracleAtom);
	const params = useParams<{organisationId: string, oracleId: string}>()
	const organisationId = parseInt(params.organisationId);
	const oracleId = parseInt(params.oracleId);
	const {data, isLoading, error, mutate} = useFetchOracleInOrganisation(organisationId, oracleId);


	// init
	useEffect(() => {
		setOracle(data);
		setReferenceOracle(data)
	}, [data]);



	if (isLoading) {
		return <FullPageLoadingComponent />;
	}
	if (!oracle || !data || error) return <>An error occurred</>


	return <OracleView
		refreshOracle={() => mutate()}
	/>
}

export const useOracle = () => {
	const oracle = useAtomValue(oracleAtom);
	if (!oracle) throw 'Undefined oracle';
	return oracle;
}


function OracleView(
	{refreshOracle}: {refreshOracle: () => void}
) {

	return <Box className={"space-y-4 flex flex-col relative"}>
		<Card className={"w-full top-0 z-20 sticky bg-white"}>
			<CardBody>
				<OracleNavbar refreshOracle={refreshOracle}/>
			</CardBody>
		</Card>


		<Card>
			<CardBody className={"flex flex-col gap-16"}>
				<OracleOverview />
				<div className={"flex flex-col"}>
					<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
						<Box>
							<Typography variant={"h6"}>Oracle Definition</Typography>
							<Typography variant={"paragraph"}>
								Edit the definition of your oracle below.
							</Typography>
						</Box>
						<Box>
							<a href={"https://docs.carmentis.io/how-to/declare-oracle"}  target={"_blank"} className={"hover:cursor-pointer"}>
								<i className={"bi bi-question-circle-fill"} />
							</a>
						</Box>
					</Box>
					<div className={"min-h-screen"}>
						<TabsComponent
							defaultTabValue={'Services'}
							panels={{
								'Services': <ServicesPanel />,
								'Structures': <StructurePanel />,
								'Enumerations': <EnumerationsPanel />,
								'Masks': <MasksPanel />,
								'Code View': <CodeViewPanel/>,
								'Errors': <ErrorsPanel context={"oracle"}/>
							}} />
					</div>
				</div>
			</CardBody>
		</Card>
	</Box>
}



function OracleNavbar(
	{refreshOracle}: {refreshOracle: () => void}
) {
	const callOracleUpdate = useOracleUpdate();
	const router = useRouter();
	const notify = useToast();
	const oracle = useAtomValue(oracleAtom)
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const callOracleDeletion = useOracleDeletion();
	const callOraclePublication = useOraclePublication();
	const isModified = useAtomValue(oracleIsModifiedAtom);
	const setReferenceOracle = useSetAtom(referenceOracleAtom);
	const confirmationModal = useConfirmationModal();

	const [saving, setSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

	console.log("oracle.isDraft?", oracle.isDraft)

	function deleteOracle() {
		confirmationModal(
			"Publish Oracle",
			"This action cannot be undone",
			'Publish',
			"Cancel",
			() => {
				callOracleDeletion(organisationId, oracle.id, {
					onSuccess: () => {
						refreshOracle()
						notify.info('Oracle deleted');
						router.push(`/home/organisation/${organisationId}/oracle`);
					},
					onError: notify.error,
				});
			}
		)


	}

	function save() {
		setSaving(true);
		callOracleUpdate(organisationId, oracle, {
			onSuccess: () => {
				setReferenceOracle(oracle);
				notify.info('Oracle saved');
				refreshOracle()
			},
			onError: notify.error,
			onEnd: () => {
				setSaving(false);
			},
		});
	}

	function publish() {
		confirmationModal(
			"Publish Oracle",
			"This action cannot be undone",
			'Publish',
			"Cancel",
			() => {
				setIsPublishing(true);
				callOraclePublication(organisation.id, oracle.id, {
					onSuccess: () => {
						notify.success('Oracle published');
						refreshOracle()
					},
					onError: notify.error,
					onEnd: () => setIsPublishing(false)
				})
			}
		)

	}

	if (!oracle) return <Skeleton/>
	return <EntityStatusHeader
	 	name={oracle.name}
		version={oracle.version}
		published={oracle.published}
		isDraft={oracle.isDraft}
		save={save}
		isSaving={saving}
		isModified={isModified}
	 	delete={deleteOracle}
		download={() => {}}
	 	publish={publish}
	/>
}



function OracleOverview() {
	// Oracle data
	const oracle = useOracle();
	const [name, setName] = useState(oracle.name);
	const updateOracle = useUpdateOracle();

	useEffect(() => {
		updateOracle({
			...oracle,
			name
		})
	}, [name]);

	const inputs = [
		{ label: 'Oracle name', value: name, onChange: setName },
	]

	const content = inputs.map(
		(i,index) => <TextField key={index} size={"small"} label={i.label} value={i.value} onChange={(e) => i.onChange && i.onChange(e.target.value)} disabled={i.disabled}/>
	)
	return <>
		<div className={"flex flex-col space-y-4"}>
			<div>
				<Typography variant={"h6"}>Oracle Information</Typography>
				<Typography variant={"paragraph"}>
					Edit the name of the oracle below.
				</Typography>
			</div>
			<div className="flex flex-col gap-6">
				{content}
			</div>
		</div>
		<div className={"mflex flex-col space-y-4"}>
			<div>
				<Typography variant={"h6"}>Publication Information</Typography>
				<Typography variant={"paragraph"}>
					Below are listed the oracle id and version. These information are useful to use this
					oracle.
				</Typography>
			</div>
			<div className="flex flex-col gap-4">
				<div>
					<Typography variant={"paragraph"}>Oracle Id</Typography>
					<Typography
						className={"w-full bg-gray-300 p-2 rounded"}>{oracle.virtualBlockchainId}</Typography>
				</div>
				<div>
					<Typography variant={"paragraph"}>Oracle Version</Typography>
					<Typography
						className={"w-full bg-gray-300 p-2 rounded"}>{oracle.version}</Typography>
				</div>
			</div>
		</div>
	</>
}











