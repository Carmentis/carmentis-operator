'use client';

import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { Typography } from '@material-tailwind/react';
import FlexCenter from '@/components/flex-center.component';
import { useEffect, useRef, useState } from 'react';
import FullSpaceSpinner from '@/components/full-page-spinner.component';
import {
    APICallbacks,
    ChallengeSuccessResponse,
    TOKEN_STORAGE_ITEM,
    useChallengeVerification,
    useNotWhitelistedUserCreation,
    useObtainChallenge,
} from '@/components/api.hook';
import { useToast } from '@/app/layout';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import VersionDisplay from '@/components/version-number';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button } from '@material-tailwind/react';


export default function Login() {
    const {data, isLoading} = useObtainChallenge();

    if (isLoading || !data) return <FullSpaceSpinner label={"Obtaining challenge..."}/>
    return <ChallengeLogin challenge={data.challenge}/>
}

type ChallengeResponse = {
    challenge: string,
    signature: string,
    publicKey: string,
}
function ChallengeLogin({challenge}: {challenge: string}) {
    const toast = useToast();
    const verifyChallenge = useChallengeVerification();
    const navigation = useApplicationNavigationContext();

    // Define states for the account creation modal
    const [showAccountCreationModal, setShowAccountCreationModal] = useState(false);
    const [knownPublicKey, setKnownPublicKey] = useState('');
    const challengeResponseRef = useRef<ChallengeResponse|undefined>();

    function storeToken(token: string) {
        localStorage.setItem(TOKEN_STORAGE_ITEM, token)
    }

    function onSuccessAuthentication(response: ChallengeSuccessResponse) {
        storeToken(response.token);
        toast.success("You are connected")
        navigation.navigateToHome();
    }

    function onNotWhitelistedUserCreated() {
        if (!challengeResponseRef.current) {
            throw "Challenge response ref not supposed to be undefined here"
        }
        attemptToAuthenticate(challengeResponseRef.current, {
            onSuccessData: onSuccessAuthentication,
            onError: (e) => {
                toast.error(`Connection failure: ${e}`)
            }
        })
    }

    function onChallengeResponse(answer: ChallengeResponse) {
        challengeResponseRef.current = answer;
        attemptToAuthenticate(answer, {
            onSuccessData: onSuccessAuthentication,
            onError: (e, r) => {
                if (r.status === 404) {
                    setKnownPublicKey(answer.publicKey)
                    setShowAccountCreationModal(true);
                } else {
                    toast.error(`Connection failure: ${e}`)
                }
            }
        })
    }

    function attemptToAuthenticate( challengeResponse: ChallengeResponse, cb: APICallbacks<ChallengeSuccessResponse>  ) {
        verifyChallenge(challengeResponse.challenge, challengeResponse.signature, challengeResponse.publicKey, cb)
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
        <CustomModal
            onNotWhitelistedUserCreated={onNotWhitelistedUserCreated}
            publicKey={knownPublicKey}
            isOpen={showAccountCreationModal}
            onClose={() => setShowAccountCreationModal(false)}
        />
    </section>
}

function BottomRightVersionNumber() {
    return <div className={"absolute right-5 bottom-5"}>
        <VersionDisplay/>
    </div>
}


function CustomModal({ isOpen, onClose, publicKey, onNotWhitelistedUserCreated }: { isOpen: boolean, onClose: () => void, publicKey?: string, onNotWhitelistedUserCreated: () => void }) {
    const callUserCreationApi = useNotWhitelistedUserCreation()
    const [formData, setFormData] = useState({
        publicKey: publicKey || '',
        firstName: '',
        lastName: '',
    });

    useEffect(() => {
        setFormData(data => {return {...data, publicKey: publicKey || ''}})
    }, [publicKey]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const {publicKey, firstName, lastName} = formData;
        callUserCreationApi(publicKey, firstName, lastName, {
            onSuccess: onNotWhitelistedUserCreated,
            onError: console.error
        })
    }

    const inputs = [
        { label: "Public Key", name: "publicKey", disabled: true, value: formData.publicKey },
        { label: "Firstname", name: "firstName", value: formData.firstName, onChange: handleChange },
        { label: "Lastname", name: "lastName", value: formData.lastName }
    ]

    const inputsContent = inputs.map((i,index) =>  <Input
        key={index}
        label={i.label}
        name={i.name}
        value={i.value}
        disabled={i.disabled}
        onChange={handleChange}
        required
    />);

    return (
        <Dialog open={isOpen} handler={onClose}>
            <DialogHeader>Account creation</DialogHeader>
            <form onSubmit={handleSubmit}>
                <DialogBody className={"space-y-12"}>
                    <Typography>
                        You are currently not registered in the workspace. Please, enter the following information
                        to create an account and enter the workspace.
                    </Typography>
                    <div className="flex flex-col gap-4">
                        {inputsContent}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="white" onClick={onClose} className="mr-2">
                        Cancel
                    </Button>
                    <Button variant="gradient" color="blue" type="submit">
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}

