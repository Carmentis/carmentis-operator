import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import { InterfaceStoreContext } from '@/app/admin/layout';
import { useParams, useRouter } from 'next/navigation';

function SidebarItem(
	input: { icon: string, text: string, link?: string, className?: string, onClick?: () => void },
) {
	const interfaceStore = useContext(InterfaceStoreContext);
	const interfaceState = interfaceStore?.getState();
	const params : {organisationId: string} = useParams();


	const itemClass = `cursor-pointer hover:bg-gray-100 p-2 justify-center items-center align-middle text-center rounded ${input.className}`;

	const content = <>
		<i className={`bi ${input.icon} flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
		<span
			hidden={!interfaceState?.sidebarHidden}
			className=" text-left rtl:text-right whitespace-nowrap">
						{input.text}
					</span>
	</>

	if (input.link) {
		return  <Link href={`/home/organisation/${params.organisationId}` + input.link} className={itemClass}> {content} </Link>;
	} else {
		return <div className={itemClass} onClick={input.onClick}> {content} </div>
	}
}

export default function Sidebar() {


	/*
	<div className="flex flex-row justify-between mb-2">
			<h5>Organisation</h5>
			<button><i className={"bi bi-pen"}></i></button>
		</div>

		<div className={"flex items-center"}>
			<Image src={"/default-user-icon.svg"} alt={"/"} width={80} height={80} className={"w-10 mr-2"} />
			<p>My Company</p>
		</div>

		<div className="org-information mt-2">
			<div className={"flex items-center justify-between p-2 border-2 border-gray-200 rounded-md"}>
				<p className={"font-bold"}>Balance</p>
				<p>0.00 CMTS</p>
			</div>
		</div>
	 */

	const router = useRouter();
	function backRouter() {
		router.back();
	}



	return <div className={"h-full"}>
		<ul className={"flex flex-col h-full"}>
			<SidebarItem icon={"bi-arrow-left"} text={"Home"} className={"border-b-2 border-gray-200"} onClick={backRouter}></SidebarItem>

			<SidebarItem icon={"bi-house"} text={"Home"} link={"/"}></SidebarItem>
			<SidebarItem icon={"bi-people"} text={"Users"} link={`/user`}></SidebarItem>
			<SidebarItem icon={"bi-boxes"} text={"Applications"} link={"/application"}></SidebarItem>
			<SidebarItem icon={"bi-arrow-left-right"} text={"Oracles"} link={"/oracle"}></SidebarItem>
		</ul>
	</div>
}