import { OracleServiceOutputField } from '@/components/api.hook';
import { useOracle, useSetOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';
import {
	FieldEditionCard
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';

export function OracleServiceOutputFieldEditionCard(
	input: {
		serviceName: string,
		field: OracleServiceOutputField,
		onRemoveField: () => void
	}
) {
	const oracle = useOracle();
	const setOracle = useSetOracle();
	const field = input.field;

	function refreshType(refreshedField) {
		setOracle(e => e.updateServiceOutput(
			input.serviceName,
			field.name,
			refreshedField
		))
	}

	return <FieldEditionCard
		field={input.field}
		onRemoveField={input.onRemoveField}
		refreshType={refreshType}
		getStructures={() => oracle.data.structures}
		getEnumerations={() => oracle.data.enumerations}
		getMasks={() => oracle.data.masks}
	/>
}
