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
        <CardBody className={"space-y-4"}>
            <Typography variant={"h4"}>Connectivity Status</Typography>
            <Typography>
                Below is presented the connection status with the operator API.
            </Typography>
            <Typography> <OperatorConnectionStatus/></Typography>
        </CardBody>
    </Card>
}

function OperatorConnectionStatus() {
    const {data, error, isLoading} = useFetchOperatorInitialisationStatus();

    if (isLoading)  return 'Contacting...'
    if (!data || error) return 'Connection failure'
    return `Connected (${data.initialised ? 'Initialised' : 'Not initialised'})`
}

