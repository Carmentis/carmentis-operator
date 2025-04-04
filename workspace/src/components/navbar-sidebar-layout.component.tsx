import { PropsWithChildren, ReactNode } from 'react';
import { useInterfaceContext } from '@/contexts/interface.context';
import { Box } from '@mui/material';

export interface NavbarSidebarProps {
	sidebar: ReactNode,
	navbar: ReactNode,
}


function NavbarLayout({children}: PropsWithChildren) {
	const NAVBAR_CLASSES = 'navbar w-100 bg-white flex flex-row px-10 p-2 h-14';


	return (
		<nav className={NAVBAR_CLASSES}>
			{children}
		</nav>
	);

}




export default function NavbarSidebarLayout(
	{ sidebar, navbar, children }: PropsWithChildren<NavbarSidebarProps>,
) {
	// change the width of the sidebar if closed or not
	const interfaceStore = useInterfaceContext();
	const sidebarWidth = interfaceStore.sidebarHidden ? 'w-14' : 'w-64';
	const contentWidth = interfaceStore.sidebarHidden ? 'ml-14' : 'ml-64';


	//h-[calc(100vh-4rem)]
	return <Box width={"100%"} height={"100%"} className={"bg-gray-100"}>

		<div className="flex flex-1 h-full">
			<div className={`fixed top-0 left-0 ${sidebarWidth} h-full `}>
				<ul className={'flex flex-col w-full h-full p-4 gap-2'}>
					{sidebar}
				</ul>
			</div>

			<div className={`${contentWidth} flex-1 p-8  overflow-y-scroll bg-white rounded-l-xl shadow-lg`}>
				{children}
			</div>
		</div>
	</Box>;
}


