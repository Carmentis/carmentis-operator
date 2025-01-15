import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';

export type EditionStatus = {
	isModified: boolean,
	setIsModified: Dispatch<SetStateAction<boolean>>
}
export const EditionStatusContext = createContext<EditionStatus|undefined>(undefined);


/**
 * Provides a context for managing and sharing the edition status across components.
 *
 * @param {PropsWithChildren} props - The props containing children components to be wrapped by the context provider.
 * @return {React.JSX.Element} The context provider wrapping the children with access to the edition status store.
 */
export function EditionStatusContextProvider({children}: PropsWithChildren) {
	const [isModified, setIsModified] = useState<boolean>(false);

	const store = {
		isModified,
		setIsModified,
	}

	return <EditionStatusContext.Provider value={store}>
		{children}
	</EditionStatusContext.Provider>
}

export function useEditionStatusContext() {
	const context = useContext(EditionStatusContext);
	if (!context) throw new Error('Cannot use useEditionStatusContext outside of EditionStatusContextProvider');
	return context;
}




export const useEditionStatus = () => {
	const context = useEditionStatusContext();
	return context.isModified;
}

export const useSetEditionStatus = () => {
	const context = useEditionStatusContext();
	return (value: boolean) => {
		context.setIsModified(value)
	}
}