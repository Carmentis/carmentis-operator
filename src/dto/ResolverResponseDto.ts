import {
	IsString,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProofInfoDto } from './ProofInfoDto';
import { ProofSignatureDto } from './ProofSignatureDto';
import { JsonObject } from '@cmts-dev/carmentis-sdk-core';

export class ResolutionProofBodyDto {
	@ApiProperty({
		title: 'The JSON to be resolved',
		description: 'The JSON data from which the resolution starts.',
		type: 'object',
		additionalProperties: true,
	})
	linkedJson: JsonObject;

	@ApiProperty({
		title: 'Resolved JSON',
		description: 'The full resolved data, as JSON.',
		type: 'object',
		additionalProperties: true,
	})
	resolvedJson: JsonObject;
}

export class ResolutionProofDto {
	@ApiProperty({
		title: 'Proof info',
		description: 'Information about the proof.',
	})
	@Type(() => ProofInfoDto)
	info: ProofInfoDto;

	@ApiProperty({
		title: 'Proof content',
		description: 'The payload content of the proof.',
	})
	@Type(() => ResolutionProofBodyDto)
	proof: ResolutionProofBodyDto;

	@ApiProperty({
		title: 'Proof signature',
		description: 'Optional proof signature.',
	})
	@Type(() => ProofSignatureDto)
	@IsOptional()
	signature?: ProofSignatureDto;
}
