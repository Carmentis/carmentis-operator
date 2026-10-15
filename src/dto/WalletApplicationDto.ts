import { ApiProperty } from '@nestjs/swagger';

export class WalletApplicationDto {
	@ApiProperty({ description: 'The local identifier of the application.', format: 'uuid' })
	id: string;

	@ApiProperty({ description: 'The virtual blockchain id of the application, null while it is not published on-chain.', nullable: true, type: String })
	vbId: string | null;

	@ApiProperty()
	name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	homepageUrl: string;

	@ApiProperty()
	logoUrl: string;

	@ApiProperty({ description: 'The local identifier of the organization owning the application.', format: 'uuid' })
	organizationId: string;
}
