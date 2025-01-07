import Image from "next/image";
import NavbarSearchBar from "@/components/navbar/searchBar";
import Avatar from 'boring-avatars';

export default function Navbar() {
    return <nav className="navbar w-100 border-b-2 border-gray-200 flex flex-row justify-between px-10 p-2 h-14">
        <Image src={"/logo-full.svg"} alt={"logo"} width={125} height={100}/>
        <div className="search-bar w-4/12">
            <NavbarSearchBar></NavbarSearchBar>
        </div>
        <div className="flex items-center justify-end w-52">
            <p className={"mr-2"}>Gael Marcadet</p>
            <Avatar name={"Gael Marcadet"} variant={"bauhaus"}  width={34}/>
        </div>
    </nav>;
}