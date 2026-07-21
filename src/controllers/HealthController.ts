import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AnchorRequestStatusResponseDto } from '../dto/AnchorRequestStatusResponseDto';
import { Controller, Get, Param } from '@nestjs/common';
import { HelloResponseDto } from '../dto/HelloResponseDto';
import { Public } from '../decorators/PublicDecorator';

@ApiTags('Health')
@Controller('/api')
export class HealthController {

	@ApiOperation({
		summary: 'Health check endpoint',
		description: 'Basic health check to confirm the server is running.'
	})
	@ApiResponse({
		status: 200,
		description: 'Server is healthy.',
		schema: {
			properties: {
				status: { type: 'string', example: 'ok' }
			}
		}
	})
	@Public()
	@Get('/health')
	health() {
		return {
			status: 'ok'
		}
	}


	/**
	 * Handles the '/hello' endpoint request.
	 * This method serves as a health check to confirm server online status
	 * and validate the functionality of the provided API key.
	 *
	 * @return {Promise<HelloResponseDto>} A promise that resolves to an object containing the hello message.
	 */
	@Get('/hello')
	@ApiOperation({
		summary: 'Hello request handler.',
		description: 'This endpoint is used to check the online status of the server and the correct API key functionality.',
	})
	@ApiResponse({
		status: 200,
		description: 'OK',
		type: HelloResponseDto
	})
	@ApiSecurity('api-key')
	async hello(): Promise<HelloResponseDto> {
		return { message: 'Hello world!' };
	}

	@Public()
	@Get('/public/hello')
	@ApiOperation({
		summary: 'Public hello request handler.',
		description: 'This endpoint is used to check the online status of the server.'
	})
	@ApiResponse({
		status: 200,
		description: 'OK',
		type: HelloResponseDto
	})
	@ApiForbiddenResponse({
		description: "Invalid API key used.",
	})
	async publicHello() {
		return { message: 'Hello world!' };
	}

}