'use client';

import { z } from 'zod';
import { useIsInitialisedQuery, useSetupFirstAdministratorMutation } from '@/generated/graphql';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField } from '@mui/material';
import { useToast } from '@/app/layout';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import Link from 'next/link';

/**
 * Zod schema for validating the setup form data
 */
const setupSchema = z.object({
    publicKey: z.string().nonempty('Public key cannot be empty'),
    firstname: z.string().nonempty('Firstname cannot be empty'),
    lastname: z.string().nonempty('Lastname cannot be empty'),
    token: z.string().nonempty('Token cannot be empty'),
});

/**
 * Type definition for the setup form data
 */
type SetupType = z.infer<typeof setupSchema>;

/**
 * Setup page component for initializing the operator with the first administrator.
 * Collects the administrator's public key, name, and token to set up the operator.
 * 
 * @returns React component
 */
export default function SetupPage() {
    const notify = useToast();
    const [setupFirstAdmin, {loading: isLoading}] = useSetupFirstAdministratorMutation();
    const {data, refetch: refetchInitializationStatus} = useIsInitialisedQuery();

    // Initialize the form with validation
    const { register, handleSubmit, formState: { errors }, } = useForm<SetupType>({
        resolver: zodResolver(setupSchema),
    });

    /**
     * Function executed when setup is successfully completed
     * Refreshes the initialization status to update the UI
     */
    function onSetup() {
        refetchInitializationStatus();
    }

    /**
     * Form submission handler
     * Sends the administrator data to the server
     * 
     * @param formData - The validated form data
     */
    const onSubmit = (formData: SetupType) => {
        setupFirstAdmin({
            variables: {
                setupFirstAdmin: formData
            }
        })
            .then(result => {
                const {data, errors} = result;
                if (errors) {
                    notify.error(errors);
                } else {
                    onSetup();
                }
            })
            .catch(e => {
                notify.error(e);
            });
    };
    const handler = handleSubmit(onSubmit);

    // Form field definitions
    const forms = [
        {
            label: 'Public Key',
            error: errors.publicKey ? true : false,
            helperText: errors.publicKey && errors.publicKey.message,
            props: register('publicKey'),
        },
        {
            label: 'Firstname',
            error: errors.firstname ? true : false,
            helperText: errors.firstname && errors.firstname.message,
            props: register('firstname'),
        },
        {
            label: 'Lastname',
            error: errors.lastname ? true : false,
            helperText: errors.lastname && errors.lastname.message,
            props: register('lastname'),
        },
        {
            label: 'Token',
            error: errors.token ? true : false,
            helperText: errors.token && errors.token.message || 'The token is visible in the logs of the operator.',
            props: register('token'),
        }
    ];

    // If operator is already initialized, show the "already initialized" view
    if (data && data.isInitialised) {
        return <AlreadyInitialised/>;
    }

    // Render the setup form
    return <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-40 h-20 mr-2" src="/logo-full.svg"
                     alt="logo"/>
            </a>
            <div
                className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-8 w-full space-y-2">
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
                    <Box
                        component={"form"}
                        display={"flex"}
                        flexDirection={"column"}
                        onSubmit={handler}
                        gap={2}>

                        {
                            forms.map(
                                (f,i) =>
                                    <TextField
                                        key={i}
                                        disabled={isLoading}
                                        size={"small"}
                                        error={f.error}
                                        helperText={f.helperText}
                                        {...f.props}
                                        label={f.label}
                                    />
                            )
                        }

                        <Button variant={"contained"} type="submit" disabled={isLoading}>Setup</Button>

                    </Box>
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
    </section>;
}

/**
 * Component shown when the operator is already initialized.
 * Provides a link to return to the login page.
 * 
 * @returns React component
 */
function AlreadyInitialised() {
    return <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="w-40 h-20 mr-2" src="/logo-full.svg"
                     alt="logo"/>
            </a>
            <div
                className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-8 w-full space-y-2">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Operator ready
                    </h1>
                    <p>
                        Your operator is initialized.
                    </p>
                    <Link href={'/'} target={'_blank'}>
                        <Button variant={"contained"}>
                            Back to login
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </section>;
}
