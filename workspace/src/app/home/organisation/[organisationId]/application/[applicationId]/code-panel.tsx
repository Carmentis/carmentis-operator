import { useApplication } from '@/contexts/application-store.context';

export default function CodeViewPanel(
) {
	const application = useApplication();

	return <>
		<pre>

			{JSON.stringify(application, null, 2)}
		</pre>
	</>;
}