'use client';


import { useContext } from 'react';
import { InterfaceStoreContext } from '@/app/admin/layout';
import { useStore } from 'zustand/index';

export default function AdminNavbar() {
    const context = useContext(InterfaceStoreContext)
    const store = useStore(context, (state) => state)

    const heightNavbarClass = store.sidebarHidden ?
        'w-[calc(100vw-2rem)]' :
        'w-[calc(100vw-18rem)]';

    return <nav
        className={`navbar ${heightNavbarClass} border-b-2 border-gray-200 flex flex-row justify-between px-10 p-2 h-14 bg-white -z-10`}>
        <div className={"flex items-center"}>
            <h1>Dashboard</h1>
        </div>
        <div className="flex items-center justify-between">
            <p className={'mr-2'}>Gael Marcadet</p>
            <i className={'bi bi-person navbar-icon'}></i>
        </div>
    </nav>
}