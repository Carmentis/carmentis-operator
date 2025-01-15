
import { useOracle, useOracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/data-access-layer';

import {
	FieldEditionCard,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';
import { OracleServiceOutputField } from '@/entities/oracle.entity';

export function OracleServiceOutputFieldEditionCard(
	input: {
		serviceName: string,
		field: OracleServiceOutputField,
		onRemoveField: () => void
	}
) {
	const oracle = useOracle();
	const setOracle = useOracleEditor();
	const field = input.field;

	function refreshType(refreshedField: OracleServiceOutputField) {
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
