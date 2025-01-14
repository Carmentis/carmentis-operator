import { OracleServiceInputField } from '@/components/api.hook';
import { useOracle, useSetOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';
import { useEffect, useState } from 'react';
import { PrimitiveType } from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {
	Checkbox,
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import {
	FieldEditionCard
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-card';

export function OracleServiceInputFieldEditionCard(
	input: {
		serviceName: string,
		field: OracleServiceInputField,
		onRemoveField: () => void
	},
) {
	const oracle = useOracle();
	const setOracle = useSetOracle();
	const field = input.field;

	function refreshType(refreshedField) {
		setOracle(e => e.updateServiceInput(
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
