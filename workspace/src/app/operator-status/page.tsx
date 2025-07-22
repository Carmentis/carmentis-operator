'use client';

import { useGetInitialisationStatusQuery } from '@/generated/graphql';
import { Card, CardContent, Typography } from '@mui/material';

export default function TestPage() {
    return <div className={"bg-gray-100"}>
        <div className={`w-full h-full flex justify-center items-center align-middle`}>
            <OperatorConnectionCard/>
        </div>
    </div>
}

function OperatorConnectionCard() {
    return <Card>
        <CardContent className={"space-y-4"}>
            <Typography variant={"h4"}>Connectivity Status</Typography>
            <Typography>
                Below is presented the connection status with the operator API.
            </Typography>
            <Typography> <OperatorConnectionStatus/></Typography>
        </CardContent>
    </Card>
}

function OperatorConnectionStatus() {
    const {data, error, loading: isLoading} = useGetInitialisationStatusQuery();

    if (isLoading)  return 'Contacting...'
    if (!data || error) return 'Connection failure'
    return `Connected (${data.isInitialised ? 'Initialised' : 'Not initialised'})`
}

