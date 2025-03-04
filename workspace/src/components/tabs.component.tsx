import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react';
import { ReactNode } from 'react';

interface TabsComponentMap {
	[key: string]: ReactNode;
}

// Constants for styles to enhance readability.
const DEFAULT_TAB_CLASSNAME = 'w-full';
const HEADER_CLASSNAME =
	'bg-white';
const INDICATOR_PROPS = {
	className:
		'bg-primary-light !text-white',
};

// Helper function to render tabs.
function renderTabs(panels: TabsComponentMap) {
	return Object.entries(panels).map(([key]) => (
		<Tab key={key} value={key}>{key}</Tab>
	));
}

// Helper function to render tab panels.
function renderTabPanels(panels: TabsComponentMap) {
	return Object.entries(panels).map(([key, component]) => (
		<TabPanel key={key} value={key}>
			{component}
		</TabPanel>
	));
}

/**
 * Renders a TabsComponent which displays a tabbed interface created from the provided panels.
 *
 * @param {Object} input - The input object containing the panels configuration.
 * @param {TabsComponentMap} input.panels - A map object where each key represents the identifier of a panel, and the value is the component rendered for that panel.
 * @param {string} [defaultTabValue='fields'] - The default active tab value.
 * @return {JSX.Element} The rendered Tabs component with headers and content panels.
 */
export default function TabsComponent(
	{
		panels,
		defaultTabValue = 'fields',
	}: {
		panels: TabsComponentMap;
		defaultTabValue?: string;
	},
) {
	return (
		<Tabs  value={defaultTabValue}>
			<TabsHeader >
				{renderTabs(panels)}
			</TabsHeader>
			<TabsBody>
				{renderTabPanels(panels)}
			</TabsBody>
		</Tabs>
	);
}