import { OracleStructureField } from '@/components/api.hook';
import { useOracle, useSetOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';
import {
	FieldEditionCard
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';

export default function OracleStructureFieldEditionCard(
	input: {
		structureName: string,
		field: OracleStructureField,
		onRemoveField: (fieldName: string) => void
	}
) {




	const structureName = input.structureName;
	const oracle = useOracle();
	const setOracle = useSetOracle();
	const field = input.field;

	function refreshType(refreshedField) {
		setOracle(e => e.updateStructureField(
			structureName,
			field.name,
			refreshedField
		))
	}

	return <FieldEditionCard
		field={input.field}
		onRemoveField={() => input.onRemoveField(field.name)}
		refreshType={refreshType}
		getStructures={() => oracle.data.structures}
		getEnumerations={() => oracle.data.enumerations}
		getMasks={() => oracle.data.masks}
	/>
}