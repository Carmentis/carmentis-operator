
import { useOracle, useOracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/data-access-layer';

import {
	FieldEditionComponent,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-component';
import { OracleStructureField } from '@/entities/oracle.entity';

export default function OracleStructureFieldEditionCard(
	input: {
		structureName: string,
		field: OracleStructureField,
		onRemoveField: (fieldName: string) => void
	}
) {




	const structureName = input.structureName;
	const oracle = useOracle();
	const setOracle = useOracleEditor();
	const field = input.field;

	function refreshType(refreshedField: OracleStructureField) {
		setOracle(e => e.updateStructureField(
			structureName,
			field.name,
			refreshedField
		))
	}

	return <FieldEditionComponent
		field={input.field}
		onRemoveField={() => input.onRemoveField(field.name)}
		refreshType={refreshType}
		getStructures={() => oracle.data.structures}
		getEnumerations={() => oracle.data.enumerations}
		getMasks={() => oracle.data.masks}
	/>
}