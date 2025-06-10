'use client';

import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { Typography } from '@mui/material';
import FlexCenter from '@/components/flex-center.component';
import { useEffect, useRef, useState } from 'react';
import FullSpaceSpinner from '@/components/full-page-spinner.component';
import { useToast } from '@/app/layout';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import VersionDisplay from '@/components/version-number';
import { useGetChallengeQuery, useVerifyChallengeMutation } from '@/generated/graphql';
import { TOKEN_STORAGE_ITEM } from '@/contexts/user-authentication.context';



export default function Login() {
    const {data, loading, error} = useGetChallengeQuery({
        variables: {}
    })

    if (loading || !data) return <FullSpaceSpinner label={"Obtaining challenge..."}/>
    return <ChallengeLogin challenge={data.getChallenge.challenge}/>
}

type ChallengeResponse = {
    challenge: string,
    signature: string,
    publicKey: string,
}
function ChallengeLogin({challenge}: {challenge: string}) {
    const toast = useToast();
    const [verifyChallenge] = useVerifyChallengeMutation()
    const navigation = useApplicationNavigationContext();

    function storeToken(token: string) {
        localStorage.setItem(TOKEN_STORAGE_ITEM, token)
    }

    function onSuccessAuthentication(token: string) {
        storeToken(token);
        toast.success("You are connected")
        navigation.navigateToHome();
    }


    function onChallengeResponse(answer: ChallengeResponse) {
        verifyChallenge({
            variables: {
                challenge: answer.challenge,
                publicKey: answer.publicKey,
                signature: answer.signature
            }
        }).then(response => {
            if (response.data) {
                onSuccessAuthentication(response.data.verifyChallenge.token)
            } else {
                // TODO do this case
            }
        })
    }

    useEffect(() => {
        const wiClient = new sdk.wiClient;
        wiClient.attachQrCodeContainer("qr-code");
        wiClient.setServerUrl(process.env.NEXT_PUBLIC_OPERATOR_URL);
        wiClient.attachExtensionButton("extension-button")
        wiClient.authenticationByPublicKey(challenge)
            .then(onChallengeResponse)
            .catch(console.error);
    }, []);

    return <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
            <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-40 h-20 mr-2" src="/logo-full.svg"
                     alt="logo" />
            </a>
            <div
                className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <Typography variant={"h4"}>Sign in to your workspace</Typography>
                    <FlexCenter className={'flex-col'}>
                        <div id={'qr-code'} className={"mb-2"} />
                        <button id="extension-button"
                                className={'button py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100'}>Use
                            your extension
                        </button>
                    </FlexCenter>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don’t have a wallet yet?  <a href="https://docs.carmentis.io/how-to/get-your-carmentis-wallet"
                                                     target={"_blank"}
                                                      className="font-medium text-primary-600 hover:underline dark:text-primary-500">Get your wallet</a>
                    </p>
                </div>
            </div>
        </div>
        <BottomRightVersionNumber/>
    </section>
}

function BottomRightVersionNumber() {
    return <div className={"absolute right-5 bottom-5"}>
        <VersionDisplay/>
    </div>
}
