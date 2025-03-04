import { useOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';


export default function CodeViewPanel(
) {
	const oracle = useOracle();

	return <>
		<pre>

			{JSON.stringify(oracle, null, 2)}
		</pre>
	</>;
}