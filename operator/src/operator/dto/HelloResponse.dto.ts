import { ApiProperty } from '@nestjs/swagger';

/**
 * This class is used to return a simple message to the client.
 */
export class HelloResponseDto {
	@ApiProperty({ description: 'The message to return to the client.', example: 'Hello world!' })
	message: string;
}