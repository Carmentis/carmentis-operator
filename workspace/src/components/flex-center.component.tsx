import { PropsWithChildren } from 'react';

/**
 * Interface representing the properties for a FlexCenter component.
 *
 * @interface
 * @property {string} [className] - An optional string to specify the CSS class for the component, allowing for custom styling.
 */
export interface FlexCenterProps {
	className?: string
}
/**
 * A functional component that centers its children both vertically and horizontally
 * using flexbox styling.
 *
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The child elements to render within the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the component.
 * @return {JSX.Element} A flexbox container wrapping the content.
 */
export default function FlexCenter({children, className}: PropsWithChildren<FlexCenterProps>) {
	return <div className={`w-full h-full flex justify-center items-center align-middle ${className}`}>
		{children}
	</div>
}