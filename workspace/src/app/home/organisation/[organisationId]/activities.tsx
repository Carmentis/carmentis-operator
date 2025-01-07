'use client';

import {
	Card,
	CardBody,
	Timeline, TimelineBody,
	TimelineConnector,
	TimelineHeader, TimelineIcon,
	TimelineItem,
	Typography,
} from '@material-tailwind/react';
import { useParams } from 'next/navigation';
import { OrganisationLog, useFetchOrganisationLogs } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';

export default function RecentActivities() {

	/**
	 * Formats a given date.
	 *
	 * @param date
	 */
	function formatDate( date: string ) {
		return  new Date(date).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		});
	}

	function formatOperationType( operationType: string ) {
		return operationType.replaceAll('_', ' ');
	}

	function formatDescription( log: OrganisationLog ) {
		switch ( log.operation ) {
			case 'ORGANISATION_CREATION': return 'Creation of organisation'
			case 'ORGANISATION_USER_INSERTION': return <span>
				User <b>{log.data.name}</b> added in organisation.
			</span>
			case 'ORGANISATION_USER_DELETION': return <span>
				User <b>{log.data.name}</b> removed from organisation.
			</span>
			case 'APPLICATION_CREATION': return <span>
				Application <b>{log.data.name}</b> created.
			</span>
			default: return ''
		}
	}




	const params = useParams();
	const organisationId = parseInt(params.organisationId);
	const { data, isLoading } = useFetchOrganisationLogs(organisationId);


	let content = <></>;
	if ( !data || isLoading ) {
		content = <Skeleton count={3}/>
	} else {
		content = <>
			<Timeline>
				{
					data.map((l, index) =>
						<TimelineItem key={index}>
							<TimelineConnector />
							<TimelineHeader className="h-3">
								<TimelineIcon />
								<Typography variant="h6" color="blue-gray" className="leading-none">
									{formatOperationType(l.operation)} - {formatDate(l.timestamp)}
								</Typography>
							</TimelineHeader>
							<TimelineBody className="pb-8">
								<Typography variant="small" color="gary" className="font-normal text-gray-600">
									{formatDescription(l)}
								</Typography>
							</TimelineBody>
						</TimelineItem>)
				}
			</Timeline>
		</>
	}

	return <>

		<Card>
			<CardBody>
				<Typography variant={"h5"} className={"mb-8"}>Activities</Typography>
				{content}
			</CardBody>
		</Card>
	</>
}