'use client';

import { AuthenticatedUserSidebarItem, ClickableSidebarItem, LinkSidebarItem } from '@/components/sidebar-components';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';

export default function AdminSidebar() {

	const navigation = useApplicationNavigationContext();

	const sidebarItems = [
		{ icon: 'bi-house', text: 'Home', link: '/admin', activeRegex: /admin$/ },
		{ icon: 'bi-person', text: 'Users', link: '/admin/organisation', activeRegex: /organisation/ },
		{ icon: 'bi-building', text: 'Organisations', link: '/admin/user', activeRegex: /user/ },
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