import { Chip } from '@mui/material';
import React from 'react';
import { ApiKeyDescriptionFragment } from '@/generated/graphql';


export default function useApiKeyStatusFormatter() {
	return (apiKey: ApiKeyDescriptionFragment) => {
		let status;
		if (apiKey.isActive) {
			if ( typeof apiKey.activeUntil == 'string' ) {
				const activeUntil = new Date(apiKey.activeUntil);
				const now = new Date();
				if (activeUntil < now) {
					status = <Chip label={"Exceeded lifetime"} />
				} else {
					status = <Chip label={"Active"} color={"primary"}/>
				}
			} else {
				status = <Chip label={"Active"} color={"primary"} />
			}
		} else {
			status = <Chip label={"Inactive"} />
		}
		return status;
	}

}