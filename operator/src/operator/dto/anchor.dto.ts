import { IsBoolean, IsDefined, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChannelDto {
	@ApiProperty({ description: 'Name of the channel' })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Indicates whether the channel is public or private' })
	@IsBoolean()
	public: boolean;
}

export class ActorDto {
	@ApiProperty({ description: 'Name of the actor' })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Public key of the actor' })
	@IsString()
	publicKey: string;
}

export class FieldAssignationDto {
	@ApiProperty({ description: 'The name of the channel to assign the fields.' })
	@IsString()
	channelName: string;

	@ApiProperty({ description: 'Fields involved in this assignation.' })
	@IsString()
	fieldPath: string;
}

export class ActorAssignationDto {
	@ApiProperty({ description: 'The name of the channel visible by the actor.' })
	@IsString()
	channelName: string;

	@ApiProperty({ description: 'Actor involved in this assignation.' })
	@IsString()
	actorName: string;
}


export class AnchorDto {
	@ApiProperty({
		description: 'Identifier of the virtual blockchain in which the data will be anchored. When omitted, a new virtual blockchain is created.'
	})
	@IsString()
	@IsOptional()
	virtualBlockchainId?: string;

	@ApiProperty({ type: [ChannelDto], description: 'List of channels' })
	@ValidateNested({ each: true })
	@Type(() => ChannelDto)
	channels: ChannelDto[];

	@ApiProperty({ type: [ActorDto], description: 'List of actors' })
	@ValidateNested({ each: true })
	@Type(() => ActorDto)
	actors: ActorDto[];

	@ApiProperty({ description: 'The data object to be processed', type: Object })
	@IsDefined()
	data: Object;

	@ApiProperty({ type: [FieldAssignationDto], description: 'List of field assignations' })
	@ValidateNested({ each: true })
	@Type(() => FieldAssignationDto)
	fieldAssignation: FieldAssignationDto[];

	@ApiProperty({ type: [ActorAssignationDto], description: 'List of actor assignations' })
	@ValidateNested({ each: true })
	@Type(() => ActorAssignationDto)
	actorAssignation: ActorAssignationDto[];
}

export class AnchorWithWalletInitiationDto extends AnchorDto {
	@ApiProperty({ description: 'Message displayed on the wallet.' })
	@IsString()
	message: string;
}
