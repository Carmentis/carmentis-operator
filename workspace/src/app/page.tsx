'use client';

import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { Typography } from '@material-tailwind/react';
import FlexCenter from '@/components/flex-center.component';
import { useEffect } from 'react';


interface WalletExtension {
    openPopup: (data: string) => void
}

export default function Login() {
    const wiClient = new sdk.wiClient;
    const challenge =  sdk.crypto.generateKey256();

    useEffect(() => {
        wiClient.attachQrCodeContainer("qr-code");
        wiClient.setServerUrl(process.env.NEXT_PUBLIC_OPERATOR_URL);
        wiClient.authenticationByPublicKey(challenge)
            .then(console.log);
    }, []);


    async function useExtension() {
        console.log("Accessing data contained in the QR code...")
        const qrData: string = wiClient.getQrData("qr-code")
        console.log("Data contained in the QR code:", qrData)

        console.log("Calling the extension...")
        try {
            //window.carmentisWallet.openPopup(qrData)
            const result = await window.carmentisWallet.authenticateByPublicKey(
                challenge
            );
            console.log(result)
        } catch (e) {
            console.error(e)
        }

        /*
        if (typeof window === 'undefined') return;
        if (!('carmentisWallet' in window)) {
            console.log("Extension not found")
            return;
        }

        //document.querySelector('[data-code]')?.getAttribute('data-code');
        const qrData: string = wiClient.getQrData("qr-code")
        const carmentisWallet : WalletExtension = window.carmentisWallet as WalletExtension;
        if (!('openPopup' in carmentisWallet)) return;

        // open the extension with the data read from the QR code
        console.log("Data read from the QR code: ", qrData)
        carmentisWallet.openPopup(qrData)

         */
    }

    return <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-40 h-20 mr-2" src="/logo-full.svg"
                     alt="logo"/>
            </a>
            <div
                className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <Typography variant={"h4"}>Sign in to your workspace</Typography>
                    <FlexCenter className={'flex-col'}>
                        <div id={'qr-code'}  className={"mb-2"}/>
                        <button id="qr-connect"
                                className={'button py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100'}
                                onClick={useExtension}>Use your extension
                        </button>

                    </FlexCenter>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don’t have an account yet? <a href="#"
                                                      className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign
                        up</a>
                    </p>
                </div>
            </div>
        </div>
    </section>
}
