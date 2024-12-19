import Image from "next/image";
import NavbarSearchBar from "@/components/navbar/searchBar";

export default function Navbar() {
    return <nav className="navbar w-100 border-b-2 border-gray-200 flex flex-row justify-between px-10 p-2 h-14">
        <Image src={"/logo-full.svg"} alt={"logo"} width={125} height={100}/>
        <div className="search-bar w-4/12">
            <NavbarSearchBar></NavbarSearchBar>
        </div>
        <div className="flex items-center justify-between">
            <p className={"mr-2"}>Gael Marcadet</p>
            <i className={"bi bi-person navbar-icon"}></i>
            <i className={"bi bi-box-arrow-in-down navbar-icon"}></i>
        </div>
    </nav>;
}