import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JsonObject } from '@cmts-dev/carmentis-sdk-core';

export class CustomSectionPublicationDto {
	@ApiProperty({
		title: 'The custom JSON',
		description: 'The JSON object published as a custom section on the organization virtual blockchain.',
		type: 'object',
		additionalProperties: true,
	})
	@IsObject()
	json: JsonObject;
}

export class CertificatePublicationDto {
	@ApiProperty({
		title: 'The X.509 certificate',
		description: 'The X.509 certificate in PEM format (-----BEGIN CERTIFICATE----- ...).',
	})
	@IsString()
	@IsNotEmpty()
	pemCertificate: string;
}

export class MicroblockPublicationResponseDto {
	@ApiProperty({ description: 'The hash of the published microblock.' })
	microblockHash: string;

	@ApiProperty({ description: 'The height of the published microblock in its virtual blockchain.' })
	height: number;
}
