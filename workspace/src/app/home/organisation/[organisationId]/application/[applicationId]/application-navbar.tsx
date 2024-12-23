'use client';

import { Card, CardBody, Chip, IconButton, Spinner, Typography } from '@material-tailwind/react';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import {
	ApplicationOverview,
	useApplication,
	useEditionStatus, useSetEditionStatus,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import { useApplicationUpdateApi } from '@/components/api.hook';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useToastNotification } from '@/app/layout';

export default function ApplicationDetailsNavbar() {
	const params = useParams();
	const organisationId = parseInt(params.organisationId);
	const application = useApplication();
	const isModified = useEditionStatus();
	const setIsModified = useSetEditionStatus();
	const callApplicationUpdate = useApplicationUpdateApi();
	const [isSaving, setIsSaving] = useState(false);
	const notify = useToastNotification();
	const [hideLogo, setHideLogo] = useState(false);

	function save() {
		setIsSaving(true);
		callApplicationUpdate(organisationId, application, {
			onEnd: () => {
				setIsSaving(false)
				setIsModified(false);
				notify("Application saved")
			},
		})
	}

	function downloadApplication() {
		const encodedApplication = JSON.stringify(application);
		const jsonBlob = new Blob([encodedApplication], {
			type: "application/json",
		});

		const link = document.createElement("a");
		link.href = URL.createObjectURL(jsonBlob);
		link.download = `application-${application.name}.json`;
		link.click();

		URL.revokeObjectURL(link.href);
		notify("Application downloaded")
	}

	return <Card>
		<CardBody className={"p-3"}>
			<div className="flex justify-between">
				<div className="begin-section justify-center items-center content-center flex">
					<div className="border-r-2 border-gray-200  px-2 pr-4 flex ">
						<img src={application.logoUrl} alt="" className={"mr-4 px-0"} width={15} hidden={hideLogo}
							 onError={() => setHideLogo(true)} onLoad={() => setHideLogo(false)} />
						<Typography variant={'h5'} color={'blue-gray'}
									className={'justify-center items-center content-center'}>
							{application.name}
						</Typography>
					</div>

					<div className="border-r-2 border-gray-200  px-4">
						Version {application.version}
					</div>
					<div className=" px-4">
						{ application.published && <Chip variant="outlined" value="Published" /> }
						{ !application.published && <Chip variant="filled" value="Draft" /> }
					</div>
				</div>


				<div className={'flex'}>

					<div className="space-x-2 border-r-2 border-gray-200 pr-2">
						<IconButton  hidden={!isModified} onClick={save}>
							{ isSaving && <Spinner /> }
							{ !isSaving && <i className={"bi bi-floppy-fill"}></i>}
						</IconButton>
						<IconButton  onClick={downloadApplication} >
							<ArrowUpOnSquareIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
						</IconButton>
					</div>


					<IconButton  className={"border-l-2 border-gray-200 ml-2"} >
						<TrashIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
					</IconButton>
				</div>
			</div>

		</CardBody>
	</Card>
}

