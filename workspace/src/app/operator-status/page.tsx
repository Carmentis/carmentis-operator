'use client';

import { useEffect, useState } from 'react';
import { GrayBackground } from '@/components/background.component';
import FlexCenter from '@/components/flex-center.component';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { useFetchOperatorInitialisationStatus } from '@/components/api.hook';

export default function TestPage() {


    return <GrayBackground>
        <FlexCenter>
            <OperatorConnectionCard/>
        </FlexCenter>
    </GrayBackground>
}

function OperatorConnectionCard() {
    return <Card>
        <CardBody>
            <Typography variant={"h4"}>Connectivity failure</Typography>
            <Typography>
                It appears that we are not able to contact the API.
                Below is the current connection status.
            </Typography>
            <OperatorConnectionStatus/>
        </CardBody>
    </Card>
}

function OperatorConnectionStatus() {
    const [online, setOnline] = useState<boolean|undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useFetchOperatorInitialisationStatus({
        onSuccess: () => setOnline(true),
        onError: (error) => {
            setErrorMessage(error)
            setOnline(false)
        }
    })

    if (online === undefined)  return 'Contacting...'
    if (online) return 'Connected'
    if (!online) return 'Offline'
}

