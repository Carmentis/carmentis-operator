import { ApiProperty } from '@nestjs/swagger';

export class AnchorRequestResponseDto {
	@ApiProperty({description: 'Anchor request id used to track the anchor request.'})
	anchorRequestId: string
}