'use client';

import {FormEvent, useState} from "react";
import Spinner from "@/components/spinner";
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    const router = useRouter();
    const [publicKey, setPublicKey] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function setupPublicKey( event: FormEvent ) {
        event.preventDefault();
        setIsLoading(true);
        fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + "/setup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                publicKey: publicKey,
                lastname: lastname,
                firstname: firstname,
            }),
        })
            .then(onSetupResponse)
            .catch(onSetupFailure);
    }

    function onSetupResponse(response:any) {
        setIsLoading(false);
        if ( response.ok ) {
            router.push("/login");
        } else {
            // TODO display the error
        }
    }

    function onSetupFailure(response:any) {
        setIsLoading(false);
    }

    return <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-40 h-20 mr-2" src="/logo-full.svg"
                     alt="logo"/>
            </a>
            <div
                className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-8 w-100 space-y-2">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Operator setup
                    </h1>
                    <p>
                        Welcome to the setup page of your operator.
                    </p>
                    <p>
                        As the initial administrator of this operator, you have to provide your public key from your
                        wallet and past it in the input below.
                    </p>
                    <div className={"flex flex-col justify-content-center items-center"}>
                    </div>
                    { isLoading && <Spinner></Spinner> }
                    { !isLoading &&
                        <form onSubmit={setupPublicKey} className={"space-y-2"}>
                            <div>
                                <label htmlFor="publicKey"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Public key
                                </label>
                                <input type="text" name="publicKey" id="publicKey" placeholder=""
                                       className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                       required={true}
                                       onChange={(e) => setPublicKey(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="firstname"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Firstname
                                </label>
                                <input type="text" name="firstname" id="firstname" placeholder="Firstname"
                                       className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                       required={true}
                                       onChange={(e) => setFirstname(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastname"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Lastname
                                </label>
                                <input type="text" name="lastname" id="lastname" placeholder="Lastname"
                                       className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                       required={true}
                                       onChange={(e) => setLastname(e.target.value)}
                                />
                            </div>
                            <button
                                className=" mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded-lg w-full">
                                Submit
                            </button>
                        </form>
                    }
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Do not know how to get your public key?

                        <a href="https://docs.carmentis.io/how-to/wallet-usage#share-my-public-key"
                           target={"_blank"}
                           className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                            Click here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </section>
}