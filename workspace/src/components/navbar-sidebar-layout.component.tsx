import { PropsWithChildren, ReactNode } from 'react';
import { useInterfaceContext } from '@/contexts/interface.context';

export interface NavbarSidebarProps {
	sidebar: ReactNode,
	navbar: ReactNode,
}


function NavbarLayout({children}: PropsWithChildren) {
	const NAVBAR_CLASSES = 'navbar w-100 border-b-2 border-gray-200 flex flex-row px-10 p-2 h-14';


	return (
		<nav className={NAVBAR_CLASSES}>
			{children}
		</nav>
	);

}


function SidebarLayout({ children }: PropsWithChildren) {
	return <div className={'h-full'}>
		<ul className={'flex flex-col h-full'}>
			{children}
		</ul>
	</div>;
}

export default function NavbarSidebarLayout(
	{ sidebar, navbar, children }: PropsWithChildren<NavbarSidebarProps>,
) {
	// change the width of the sidebar if closed or not
	const interfaceStore = useInterfaceContext();
	const sidebarWidth = interfaceStore.sidebarHidden ? 'w-14' : 'w-64';
	const contentWidth = interfaceStore.sidebarHidden ? 'ml-14' : 'ml-64';


	return <>
		<NavbarLayout>
			{navbar}
		</NavbarLayout>
		<div className="flex flex-1">
			<div className={`fixed top-14 left-0 ${sidebarWidth} h-[calc(100vh-4rem)] border-r-2 border-gray-200`}>
				<SidebarLayout>
					{sidebar}
				</SidebarLayout>
			</div>

			<div className={`${contentWidth} flex-1 p-4 h-[calc(100vh-4rem)] overflow-y-scroll bg-gray-100`}>
				{children}
			</div>
		</div>
	</>;
}


