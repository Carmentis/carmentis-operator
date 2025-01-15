import { createContext, PropsWithChildren, useContext, useState } from 'react';


/**
 * Represents the interface for controlling the application's UI state and behavior.
 *
 * @interface AppInterface
 *
 * @property {boolean} sidebarHidden - Indicates whether the sidebar is currently hidden.
 * @property {Function} toggleSidebar - A function to toggle the visibility of the sidebar.
 */
export interface AppInterface {
	sidebarHidden: boolean,
	toggleSidebar: () => void,
}
/**
 * InterfaceContext is a React context object used to manage the state of the application interface.
 * It provides a way to share the `AppInterface` instance or `null` across components in the React component tree
 * without having to pass props down manually at every level.
 *
 * This context can be used to access and update the application interface
 * state across various parts of the application.
 *
 * The initial value of this context is `null`.
 */
export const InterfaceContext = createContext<AppInterface | null>(null);

/**
 * Provides the application interface context to its child components.
 * This includes the visibility state of the sidebar and a method to toggle it.
 *
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 * @return {JSX.Element} The provider component that supplies the interface context to its children.
 */
export function ApplicationInterfaceContextProvider({ children }: PropsWithChildren) {
	const [sidebarHidden, setSidebarHidden] = useState(false);
	const toggleSidebar = () => setSidebarHidden(!sidebarHidden);

	return (
        <InterfaceContext.Provider value={{ sidebarHidden, toggleSidebar }}>
            {children}
        </InterfaceContext.Provider>
    );
}

/**
 * A custom hook that provides access to the AppInterface context.
 * This hook ensures that the context is used within a valid provider.
 * Throws an error if used outside an AppInterfaceContextProvider.
 *
 * @return {AppInterface} The current value of the AppInterface context.
 */
export function useInterfaceContext(): AppInterface {
	const context = useContext(InterfaceContext);
	if (!context) {
        throw new Error('useInterfaceContext must be used within an AppInterfaceContextProvider');
    }
    return context;
}
