'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    // check if operator initialised
    fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + "/setup/status")
        .then(response => response.json())
        .then(routeBasedOnSetupStatus);

    function routeBasedOnSetupStatus(response: any) {
        if ( response.initialised ) {
            // TODO what to do when the operator is initialized ?
        } else {
            router.push("/setup")
        }
    }

    return (
        <>

        </>
    );
}
