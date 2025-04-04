import { ApiKey } from '@/components/api.hook';
import { Chip } from '@mui/material';
import React from 'react';

export default function getApiKeyStatus(apiKey: ApiKey) {
	let status;
	if (apiKey.isActive) {
		if ( typeof apiKey.activeUntil == 'string' ) {
			const activeUntil = new Date(apiKey.activeUntil);
			const now = new Date();
			if (activeUntil < now) {
				status = <Chip label={"Exceeded lifetime"} />
			} else {
				status = <Chip label={"Active"} />
			}
		} else {
			status = <Chip label={"Active"} />
		}
	} else {
		status = <Chip label={"Inactive"} />
	}
	return status;
}