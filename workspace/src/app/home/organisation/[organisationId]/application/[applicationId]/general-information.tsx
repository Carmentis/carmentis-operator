import { useUpdateApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { useApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';

export default function ApplicationOverview() {
	const application = useApplication();
	const updateApplication = useUpdateApplication();
	const [name, setName] = useState<string>(application.name);
	const [logoUrl, setLogoUrl] = useState<string>(application.logoUrl);
	const [domainUrl, setDomainUrl] = useState<string>(application.domain);
	const [tag, setTag] = useState<string | undefined>(application.tag);
	const [description, setDescription] = useState<string>(application.description);


	useEffect(() => {
		updateApplication({
			...application,
			name,
			logoUrl,
			domain: domainUrl,
			description,
			tag,
		});
	}, [name, logoUrl, domainUrl, tag, description]);

	const INPUTS = [
		{ label: 'Application name', value: name, onChange: setName },
		{ label: 'Logo URL', value: logoUrl, onChange: setLogoUrl },
		{ label: 'Website', value: domainUrl, onChange: setDomainUrl },
		{ label: 'Description', value: description, className: 'w-full', onChange: setDescription },
		{ label: 'Tag', value: tag, onChange: setTag, disabled: true },
	];

	const overviewContent = INPUTS.map((i, index) => <div key={index} className={`flex flex-col flex-1`}>
		<TextField size={'small'} label={i.label} value={i.value}
				   onChange={(e) => i.onChange && i.onChange(e.target.value)} className={i.className} disabled={i.disabled} />
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

type ApplicationIdAndVersionProps = { id: string | undefined, version: number }

function ApplicationIdAndVersion(props: ApplicationIdAndVersionProps) {
	let content;
	if (props.id) {
		content = <>
			<div>
				<Typography variant={'paragraph'}>
					Below are listed the application id and version. These information are useful to use this
					application
					declaration.
				</Typography>
			</div>
			<div className="flex flex-col gap-4">
				<div>
					<Typography variant={'paragraph'}>Application Id</Typography>
					<Typography
						className={'w-full bg-gray-300 p-2 rounded'}>{props.id || ''}</Typography>
				</div>
				<div>
					<Typography variant={'paragraph'}>Application Version</Typography>
					<Typography
						className={'w-full bg-gray-300 p-2 rounded'}>{props.version}</Typography>
				</div>
			</div>
		</>;
	} else {
		content = <Typography className={'w-full bg-gray-300 p-2 rounded'}>
			You application is currently not published.
		</Typography>;
	}
	return <div >
		<Typography variant={'h6'}>Publication Information</Typography>
		{content}
	</div>;
}


