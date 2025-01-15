import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import { Oracle } from '@/entities/oracle.entity';

/**
 * Interface representing an OracleStore configuration.
 *
 * This interface provides the structure for managing the state of
 * an Oracle, which is optionally tied to an organization. It includes
 * properties and a method for updating or setting the Oracle state.
 *
 * @property {OracleInOrganisation|undefined} oracle - Represents the Oracle associated with the organization.
 *                                                    It may be undefined if no Oracle is set.
 * @property {Dispatch<SetStateAction<OracleInOrganisation|undefined>>} setOracle - A method to update the currently
 *                                                                                   stored Oracle state. Utilizes
 *                                                                                   React's Dispatch and SetStateAction.
 */
interface OracleStore {
	oracle: Oracle|undefined,
	setOracle: Dispatch<SetStateAction<Oracle|undefined>>
}

/**
 * Represents a React context for managing the OracleStore.
 * This context provides access to the OracleStore, or undefined
 * if the context is not initialized or used outside of its Provider.
 * It is primarily used for state management within the OracleStore module.
 */
const OracleStoreContext = createContext<OracleStore|undefined>(undefined);
/**
 * Provides the context for OracleStore, allowing components to access and update the current oracle in the organisation.
 *
 * @param {PropsWithChildren} param0 An object containing the children elements to be wrapped with the context provider.
 * @return {JSX.Element} A context provider component that wraps its children and provides access to the oracle context.
 */
export function OracleStoreContextProvider({children}: PropsWithChildren) {
	const [oracle, setOracle] = useState<Oracle|undefined>(undefined);

	return (
        <OracleStoreContext.Provider value={{ oracle, setOracle }}>
            {children}
        </OracleStoreContext.Provider>
    );
}

/**
 * A custom hook that provides access to the OracleStoreContext. This hook ensures
 * the OracleStoreContext is used within a valid provider, throwing an error if not.
 *
 * @return {Object} The context value of OracleStoreContext provided by OracleStoreContextProvider.
 * @throws {Error} Throws an error if the hook is used outside of OracleStoreContextProvider.
 */
export function useOracleStoreContext() {
	const context = useContext(OracleStoreContext);
	if (!context) {
		throw new Error("Cannot use useOracleStoreContext outside of OracleStoreContextProvider")
	}
	return context;
}