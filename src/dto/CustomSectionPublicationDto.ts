import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
