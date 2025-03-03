import { useApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';


export default function CodeViewPanel(
) {
	const application = useApplication();

	return <>
		<pre>

			{JSON.stringify(application, null, 2)}
		</pre>
	</>;
}