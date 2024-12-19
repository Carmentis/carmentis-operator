'use client';

import Script from "next/script";

export default function CarmentisSignIn() {

    function onClick() {
        // @ts-ignore
        if ( typeof window !== "undefined" &&  window.carmentisWallet ) {
            // @ts-ignore
            window.carmentisWallet.openPopup(document.querySelector('[data-code]')?.getAttribute('data-code'))
        }
    }

    return <>
        <Script type="text/javascript" src={"/js/carmentis-web-sdk.min.js"}></Script>
        <Script type={"text/javascript"} src={"/js/login-sign-in.js"}></Script>
        <div className="w-100 flex justify-content-center align-items-center mb-4">
            <div id={"qr"}></div>
        </div>

        <button id="qr-connect" className={"button py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"} onClick={onClick}>Use your extension</button>
    </>
}