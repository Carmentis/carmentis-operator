import { ApiProperty } from '@nestjs/swagger';

export class AnchorRequestStatusResponseDto	{
	@ApiProperty({ description: 'The status of the anchor request.'})
	status: string;

	@ApiProperty({ description: 'Whether the anchor request has been published.' })
	published: boolean;

	@ApiProperty({ description: 'The virtual blockchain id (only if published).' })
	virtualBlockchainId?: string;

	@ApiProperty({ description: 'The micro block hash (only if published).' })
	microBlockHash?: string;
}