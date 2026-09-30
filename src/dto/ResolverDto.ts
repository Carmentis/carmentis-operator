import {
	IsOptional,
	IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JsonObject } from '@cmts-dev/carmentis-sdk-core';

enum PolicyEnum {
    THROW = 'throw',
    IGNORE = 'ignore',
}

export class ResolverPoliciesDto {
	@ApiProperty({
		title: 'Expected behavior on resolution failure',
		description: 'Field indicating whether to raise an exception or ignore the error if a resolution fails.',
		enum: PolicyEnum,
		default: PolicyEnum.THROW,
		required: false,
	})
	@IsOptional()
	@IsEnum(PolicyEnum)
	onResolutionFailure: PolicyEnum = PolicyEnum.THROW;

	@ApiProperty({
		title: 'Expected behavior on cyclic resolution',
		description: 'Field indicating whether to raise an exception or ignore the error if a cyclic resolution is detected.',
		enum: PolicyEnum,
		default: PolicyEnum.THROW,
		required: false,
	})
	@IsOptional()
	@IsEnum(PolicyEnum)
	onCyclicResolution: PolicyEnum = PolicyEnum.THROW;
}

export class ResolverDto {
	@ApiProperty({
		title: 'The JSON to be resolved',
		description: 'The JSON data from which the resolution starts.',
		type: 'object',
		additionalProperties: true,
	})
	linkedJson: JsonObject;

	@ApiProperty({
		title: "Policies",
		description: 'The policies used during the resolution.',
	})
	@Type(() => ResolverPoliciesDto)
	policies: ResolverPoliciesDto;
}
