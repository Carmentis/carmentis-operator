
import { useOracle, useOracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/data-access-layer';

import {
	FieldEditionComponent,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-component';
import { OracleServiceInputField } from '@/entities/oracle.entity';

/**
 * Renders a card component for editing an Oracle service input field.
 * Allows modification of the field's properties and removal of the field.
 *
 * @param {Object} input - The input object containing the necessary parameters.
 * @param {string} input.serviceName - The name of the Oracle service this input field belongs to.
 * @param {OracleServiceInputField} input.field - The field object representing attributes of the input field being edited.
 * @param {function} input.onRemoveField - A callback function to handle the removal of the field.
 *
 * @return {JSX.Element} A FieldEditionCard component configured for editing the specified Oracle service input field.
 */
export function OracleServiceInputFieldEditionCard(
	input: {
		serviceName: string,
		field: OracleServiceInputField,
		onRemoveField: () => void
	},
) {
	const oracle = useOracle();
	const setOracle = useOracleEditor();
	const field = input.field;


	/**
	 * Refreshes the type by updating the service input with the specified refreshed field.
	 *
	 * @param {Object} refreshedField - The field object containing new data to update the service input.
	 * @return {void} This function does not return a value.
	 */
	function refreshType(refreshedField: OracleServiceInputField) {
		setOracle(e => e.updateServiceInput(
			input.serviceName,
			field.name,
			refreshedField
		))
	}

	return <FieldEditionComponent
		field={input.field}
		onRemoveField={input.onRemoveField}
		refreshType={refreshType}
		getStructures={() => oracle.data.structures}
		getEnumerations={() => oracle.data.enumerations}
		getMasks={() => oracle.data.masks}
		disableMask={true}
		defaultIsPublic={true}
		defaultHashable={true}
	/>

}
