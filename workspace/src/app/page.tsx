'use client';

import CarmentisSignIn from '@/components/carmentis/signIn';
import { Typography } from '@material-tailwind/react';
import FlexCenter from '@/components/flex-center.component';

export default function Login() {
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
                    <FlexCenter children={<CarmentisSignIn/>} className={"flex-col"}/>
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
