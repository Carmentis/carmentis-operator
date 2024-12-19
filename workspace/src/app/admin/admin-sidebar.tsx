'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import { InterfaceStoreContext } from '@/app/admin/layout';
import { useStore } from 'zustand';

export default function AdminSidebar() {
	// get the current active tab
	const pathname = usePathname();
	const currentUrl = pathname.replace('/admin', '');

	const context = useContext(InterfaceStoreContext)
	const store = useStore(context, (state) => state)

	return <>
		<div id="sidebar" className={'h-full w-72 border-r-2 border-gray-100 fixed z-10 transition-all ease-in-out duration-300 ' + (store.sidebarHidden ?  "hiddenSidebar" : "")}>
			<div id="sidebar-logo" className={'p-4 ' + (store.sidebarHidden ? "mb-16 mt-16" : 'mb-4')}>
				{ !store.sidebarHidden &&  <Image src={'/logo-full.svg'} alt={'logo'} width={120} height={120} /> }
				{ store.sidebarHidden &&  <Image src={'/carmentis.svg'} alt={'logo'} width={120} height={120} /> }
			</div>
			<i  onClick={() => store.toggleSidebar()}
				className={"bi  absolute right-0 top-3.5 border-2 border-gray-200 w-6 rounded bg-white cursor-pointer " +
					`${ store.sidebarHidden ? 'bi-chevron-right' : 'bi-chevron-left'}`}
				id={"sidebar-toggle"}></i>
			<div id="sidebar-links">
				<ul className="">

					<Link href={'/admin'}>
						<li className={'tab ' + (currentUrl === '' ? 'active' : '')}>

							<i className={`bi bi-house flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
							<span
								className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Home</span>

						</li>
					</Link>

					<Link href={'/admin/admin'}>
						<li className={'tab ' + (currentUrl.includes('/admin') ? 'active' : '')}>


							<i className={`bi bi-gear flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
							<span
								className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Administrators</span>

						</li>
					</Link>
					<Link href={'/admin/user'}>
						<li className={'tab ' + (currentUrl.includes('/user') ? 'active' : '')}>
							<i className={`bi bi-person flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
							<span
								className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Users</span>
						</li>
					</Link>
					<Link href={'/admin/organisation'}>
						<li className={'tab ' + (currentUrl.includes('/organisation') ? 'active' : '')}>
							<i className={`bi bi-building flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
							<span
								className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Organisations</span>
						</li>
					</Link>


				</ul>
			</div>
		</div>
	</>;
}