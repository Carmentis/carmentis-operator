'use client';

import { AuthenticatedUserSidebarItem, ClickableSidebarItem, LinkSidebarItem } from '@/components/sidebar-components';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';

/**
 * Renders the admin sidebar component that displays a list of navigation items for an admin panel.
 * The sidebar includes links for various admin pages and an option to exit to the home page.
 *
 */
export default function AdminSidebar() {

	const navigation = useApplicationNavigationContext();

	const sidebarItems = [
		{ icon: 'bi-house', text: 'Home', link: '/admin', activeRegex: /admin$/ },
		{ icon: 'bi-person', text: 'Users', link: '/admin/user', activeRegex: /user/ },
		{ icon: 'bi-building', text: 'Organisations', link: '/admin/organisation', activeRegex: /organisation/ },
	]

	return <>
		<AuthenticatedUserSidebarItem/>
		{
			sidebarItems.map(
				(item,index) => <LinkSidebarItem
					key={index}
					icon={item.icon}
					text={item.text}
					link={item.link}
					activeRegex={item.activeRegex}
				/>
			)
		}
		<ClickableSidebarItem icon={'bi-door-closed'} text={'Exit'} onClick={navigation.navigateToHome}/>
	</>;
}