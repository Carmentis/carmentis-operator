import { useUpdateApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { useApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import { useToast } from '@/app/layout';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useAtomValue } from 'jotai';
import { ApplicationTypeFragment } from '@/generated/graphql';

export default function ApplicationOverview() {
	const application = useAtomValue(applicationAtom) as ApplicationTypeFragment;
	const referenceApplication = useAtomValue(referenceApplicationAtom) as ApplicationTypeFragment;
	const updateApplication = useUpdateApplication();
	const [name, setName] = useState(application.name);
	const [logoUrl, setLogoUrl] = useState(application.logoUrl);
	const [domainUrl, setDomainUrl] = useState(application.domain);
	const [description, setDescription] = useState(application.description);

	useEffect(() => {
		setName(referenceApplication.name);
		setLogoUrl(referenceApplication.logoUrl);
		setDomainUrl(referenceApplication.domain);
		setDescription(referenceApplication.description);
	}, [referenceApplication]);

	useEffect(() => {
		updateApplication({
			...application,
			name,
			logoUrl: logoUrl || '',
			domain: domainUrl || '',
			description: description || '',
		})
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
				<Typography variant={'h6'}>Application Information</Typography>
			</div>
			<div className="flex flex-col gap-6">
				{overviewContent}
			</div>
		</div>
	</>;
}

