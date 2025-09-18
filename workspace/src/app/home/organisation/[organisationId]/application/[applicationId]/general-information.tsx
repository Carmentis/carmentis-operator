import { useUpdateApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useEffect, useState } from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useAtomValue } from 'jotai';
import { ApplicationTypeFragment } from '@/generated/graphql';
import { useAsyncFn } from 'react-use';

export default function ApplicationOverview() {
	const application = useAtomValue(applicationAtom) as ApplicationTypeFragment;
	const referenceApplication = useAtomValue(referenceApplicationAtom) as ApplicationTypeFragment;
	const callUpdateApplication = useUpdateApplication();
	const [name, setName] = useState(application.name);
	const [logoUrl, setLogoUrl] = useState(application.logoUrl);
	const [domainUrl, setDomainUrl] = useState(application.website);
	const [description, setDescription] = useState(application.description);
	const [{loading: isSaving}, saveApplication] = useAsyncFn(async () => {
		return callUpdateApplication({
			...application,
			name,
			logoUrl: logoUrl || '',
			website: domainUrl || '',
			description: description || '',
		})
	})

	useEffect(() => {
		setName(referenceApplication.name);
		setLogoUrl(referenceApplication.logoUrl);
		setDomainUrl(referenceApplication.website);
		setDescription(referenceApplication.description);
	}, [referenceApplication]);

	useEffect(() => {
		saveApplication()
	}, [name, logoUrl, domainUrl, description]);

	const INPUTS = [
		{ label: 'Application name', value: name, onChange: setName },
		{ label: 'Logo URL', value: logoUrl, onChange: setLogoUrl },
		{ label: 'Website', value: domainUrl, onChange: setDomainUrl },
		{ label: 'Description', value: description, className: 'w-full', onChange: setDescription },
	];

	const overviewContent = INPUTS.map((i, index) => <div key={index} className={`flex flex-col flex-1`}>
		<TextField size={'small'} label={i.label} value={i.value}
				   onChange={(e) => i.onChange && i.onChange(e.target.value)} className={i.className} />
	</div>);


	return <>
		<div className={'flex flex-col space-y-4'}>
			<div>
				<Typography variant={'h6'} color={"primary"}>
					Application Information
				</Typography>
				<Typography variant={"body1"}>
					Edit the application information.
				</Typography>
			</div>
			<div className="flex flex-col gap-6">
				<Typography>
					<Typography className={"font-bold"} component={"span"}>Status: </Typography>
					{application.virtualBlockchainId !== undefined ? 'Published' : 'Not published'}
				</Typography>
				{overviewContent}
				<TextField
					size={'small'}
					label={"Virtual Blockchain ID"}
					disabled={true}
					value={application.virtualBlockchainId}
				/>

			</div>
		</div>
	</>;
}

/*
<Grid container spacing={2}>
					<Grid size={6}>
						<Button fullWidth={true} onClick={() => saveApplication()} disabled={isSaving}>Save</Button>
					</Grid>
					<Grid size={6}>
						<Button fullWidth={true}>Publish</Button>
					</Grid>
				</Grid>
 */

