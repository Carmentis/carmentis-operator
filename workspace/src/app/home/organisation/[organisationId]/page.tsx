'use client';

import { fetchOrganisation, useFetchOrganisationStats } from '@/components/api.hook';
import { useParams } from 'next/navigation';
import {
    Card,
    CardBody,
    IconButton,
    Timeline, TimelineBody,
    TimelineConnector, TimelineHeader, TimelineIcon,
    TimelineItem,
    Typography,
} from '@material-tailwind/react';
import { ReactElement } from 'react';
import { DefaultAppIcon, DefaultOrganisationIcon } from '@/components/icons/default-user.icon';
import Avatar from 'boring-avatars';
import Skeleton from 'react-loading-skeleton';
import RecentActivities from '@/app/home/organisation/[organisationId]/activities';


function WelcomeCard(
    input: {
        icon: string,
        title: string,
        value: string,
    }
) {
    return <Card className={"w-full"}>
        <CardBody className={'flex flex-row justify-between p-4 items-center text-center'}>
            <IconButton className={"flex "}>
                <i className={`bi ${input.icon} text-white font-bold text-lg`}></i>
            </IconButton>

            <div className="flex flex-col justify-end items-end">
                <Typography className={"font-bold"}>{input.title}</Typography>
                <Typography>{input.value}</Typography>
            </div>
        </CardBody>
    </Card>
}

function WelcomeCards() {
    const params = useParams<{ organisationId: string }>();
    const organisationId = parseInt(params.organisationId);


    const statsResult = useFetchOrganisationStats(organisationId);

    if ( !statsResult.data || statsResult.isLoading ) {
        return <Skeleton count={1}/>
    }
    const stats = statsResult.data;


    return <div id="welcome" className="flex flex-row space-x-4 mb-8">
        <div className="w-3/12">
            <WelcomeCard icon={'bi-currency-dollar'} title={'Balance'} value={stats.balance.toString()}></WelcomeCard>
        </div>
        <div className="w-3/12">
            <WelcomeCard icon={'bi-layers'} title={'Applications'} value={stats.applicationsNumber.toString()}></WelcomeCard>
        </div>
        <div className="w-3/12">
            <WelcomeCard icon={'bi-people'} title={'Users'} value={stats.usersNumber.toString()}></WelcomeCard>
        </div>
        <div className="w-3/12">
            <WelcomeCard icon={'bi-database'} title={'Storage'} value={'0'}></WelcomeCard>
        </div>
    </div>;
}

export default function Home() {

    const params: { organisationId: string } = useParams();
    const organisationId = parseInt(params.organisationId);
    const { data, loading, error } = fetchOrganisation(organisationId);

    return (
        <>

            <div className="w-full">

                <div id="welcome-logo" className={'my-12 w-full flex flex-col justify-center items-center'}>
                    <Avatar name={data?.name} className={'w-32 h-32 mb-2'} variant={'beam'}></Avatar>
                    <Typography variant={'h4'}>{data?.name}</Typography>
                </div>

                <WelcomeCards></WelcomeCards>


                <div id="activities">
                    <RecentActivities/>
                </div>
            </div>

        </>
    );
}
