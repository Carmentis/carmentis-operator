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


export default function OraclePage() {
	const [oracle, setOracle] = useAtom(oracleAtom);
	const [referenceOracle, setReferenceOracle] = useAtom(referenceOracleAtom);
	const params = useParams<{organisationId: string, oracleId: string}>()
	const organisationId = parseInt(params.organisationId);
	const oracleId = parseInt(params.oracleId);
	const {data, isLoading, error, mutate} = useFetchOracleInOrganisation(organisationId, oracleId);


	// init
	useEffect(() => {
		if (!oracle || !referenceOracle) {
			setOracle(data);
			setReferenceOracle(data)
		}
	}, [data]);



	if (isLoading) {
		return <FullPageLoadingComponent />;
	}
	if (!oracle || !data || error) return <>An error occurred</>


	return <OracleView/>
}

export const useOracle = () => {
	const oracle = useAtomValue(oracleAtom);
	if (!oracle) throw 'Undefined oracle';
	return oracle;
}


function OracleView() {

	return <Box display={"flex"} flexDirection={"column"} gap={2}>
		<Card>
			<CardBody>
				<Box className={"flex flex-row justify-between mb-4"}>
					<OracleNavbar />
				</Box>
				<OracleOverview />
			</CardBody>
		</Card>


		<Card>
			<CardBody>
				<TabsComponent
					defaultTabValue={'Services'}
					panels={{
						'Services': <ServicesPanel />,
						'Structures': <StructurePanel />,
						'Enumerations': <EnumerationsPanel />,
						'Masks': <MasksPanel />,
						'Code View': <CodeViewPanel/>
					}} />
			</CardBody>
		</Card>
	</Box>
}



function OracleNavbar() {
	const callOracleUpdate = useOracleUpdate();
	const router = useRouter();
	const notify = useToast();
	const oracle = useOracle();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const callOracleDeletion = useOracleDeletion();
	const callOraclePublication = useOraclePublication();
	const isModified = useAtomValue(oracleIsModifiedAtom);
	const setReferenceOracle = useSetAtom(referenceOracleAtom);

	const [saving, setSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

	function deleteOracle() {
		callOracleDeletion(organisationId, oracle.id, {
			onSuccess: () => {
				notify.info('Oracle deleted');
				router.push(`/home/organisation/${organisationId}/oracle`);
			},
			onError: notify.error,
		});
	}

	function save() {
		setSaving(true);
		callOracleUpdate(organisationId, oracle, {
			onSuccess: () => {
				setReferenceOracle(oracle);
				notify.info('Oracle saved');
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

	return <>
		<div id="left" className={"flex flex-row items-center"}>
				<Typography variant="h5" className={"border-r-2 mr-2 pr-2"}>{oracle.name}</Typography>
				<Typography>Version {oracle.version}</Typography>
			</div>
			<div className={"space-x-2"}>
				{isModified && <Button onClick={save}>
					{saving && <Spinner />}
					{!saving && <><i className={'bi bi-floppy-fill  mr-2'}></i><span>save</span></>}
				</Button>}

				{!isModified && oracle.isDraft && <Button onClick={publish}>
					{isPublishing && <Spinner />}
					{!isPublishing && <><i className={'bi bi-floppy-fill  mr-2'}></i><span>publish</span></>}
				</Button>}

				<IconButton  onClick={deleteOracle}>
					<TrashIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
				</IconButton>
			</div>
	</>;
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
		{ label: 'Virtual Blockchain Id', value: oracle.virtualBlockchainId, disabled: true },
		{ label: 'Version', value: oracle.version, disabled: true },
	]

	const content = inputs.map(
		(i,index) => <TextField key={index} size={"small"} label={i.label} value={i.value} onChange={(e) => i.onChange && i.onChange(e.target.value)} disabled={i.disabled}/>
	)
	return <Box display={"flex"}  gap={2}>{content}</Box>
}











