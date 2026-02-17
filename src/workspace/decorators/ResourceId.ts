import { SetMetadata } from '@nestjs/common';

export const RESOURCE_ID_KEY = 'resourceIdField';
export const ResourceId = (fieldName: string) =>
	SetMetadata(RESOURCE_ID_KEY, fieldName);