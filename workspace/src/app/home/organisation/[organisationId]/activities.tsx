'use client';

import {
	Card,
	CardBody,
	Timeline,
	TimelineBody,
	TimelineConnector,
	TimelineHeader,
	TimelineIcon,
	TimelineItem,
	Typography,
} from '@material-tailwind/react';
import { OrganisationLog, useFetchOrganisationLogs } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { useOrganisationContext } from '@/contexts/organisation-store.context';

export default function RecentActivities() {
	// Extracted constant for formatting options
	const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	};

	/**
	 * Formats a given date to a readable format.
	 * @param date
	 */
	function getFormattedDate(date: string) {
		return new Date(date).toLocaleDateString('en-GB', DATE_FORMAT_OPTIONS);
	}

	/**
	 * Formats an operation type to a readable format.
	 * @param operationType
	 */
	function getReadableOperationType(operationType: string) {
		return operationType.replaceAll('_', ' ');
	}

	/**
	 * Returns a description based on the log's operation and data.
	 * @param operation
	 * @param data
	 */
	function getLogDescription({ operation, data }: OrganisationLog) {
		switch (operation) {
			case 'ORGANISATION_CREATION':
				return 'Creation of organisation';
			case 'ORGANISATION_USER_INSERTION':
				return (
					<span>
						User <b>{data.name}</b> added in organisation.
					</span>
				);
			case 'ORGANISATION_USER_DELETION':
				return (
					<span>
						User <b>{data.name}</b> removed from organisation.
					</span>
				);
			case 'APPLICATION_CREATION':
				return (
					<span>
						Application <b>{data.name}</b> created.
					</span>
				);
			default:
				return '';
		}
	}

	/**
	 * Renders the content of the component based on data and loading state.
	 * @param logs
	 * @param isLoading
	 */
	function renderContent(logs: OrganisationLog[] | undefined, isLoading: boolean) {
		if (!logs || isLoading) {
			return <Skeleton count={5} />;
		}

		return (
			<Timeline>
				{logs.map((log, index) => (
					<TimelineItem key={index}>
						<TimelineConnector />
						<TimelineHeader className="h-3">
							<TimelineIcon />
							<Typography variant="h6" color="blue-gray" className="leading-none">
								{getReadableOperationType(log.operation)} - {getFormattedDate(log.timestamp)}
							</Typography>
						</TimelineHeader>
						<TimelineBody className="pb-8">
							<Typography variant="small"  className="font-normal text-gray-600">
								{getLogDescription(log)}
							</Typography>
						</TimelineBody>
					</TimelineItem>
				))}
			</Timeline>
		);
	}

	// Fetching data using the parsed organisationId
	const organisation = useOrganisationContext();
	const { data, isLoading } = useFetchOrganisationLogs(organisation.id);

	return (
		<Card>
			<CardBody>
				<Typography variant="h5" className="mb-8">
					Activities
				</Typography>
				{renderContent(data, isLoading)}
			</CardBody>
		</Card>
	);
}