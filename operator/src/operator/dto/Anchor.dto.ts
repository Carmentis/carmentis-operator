import { IsBoolean, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Hash, OperatorAnchorRequest, Optional } from '@cmts-dev/carmentis-sdk/server';

export class ChannelDto {
	@ApiProperty({ description: 'Name of the channel' })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Indicates whether the channel is public or private' })
	@IsBoolean()
	public: boolean;
}

export class ActorDto {
	@ApiProperty({ description: 'Name of the actor.', example: "Endorser" })
	@IsString()
	name: string;

	@ApiProperty({ description: 'Public key of the actor (optional).' })
	@IsString()
	@IsOptional()
	publicKey: string;
}

export class ChannelAssignationDto {
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


export class HashableFieldDto {
	@ApiProperty({ description: 'States that data indicated by this field is hashable.' })
	@IsString()
	fieldPath: string;
}



export class MaskableFieldPartDto {
	@ApiProperty({ description: 'Position of the masked part in the field.' })
	@IsNumber()
	position: number;

	@ApiProperty({ description: 'Length of the masked part in the field.' })
	@IsNumber()
	length: number;

	@ApiProperty({ description: 'Replacement field' })
	@IsString()
	replacementString: string;
}


export class MaskableFieldDto {
	@ApiProperty({ description: 'States that data indicated by this field is maskable.' })
	@IsString()
	fieldPath: string;

	@ApiProperty({ type: [MaskableFieldPartDto], description: 'List of masks.' })
	@ValidateNested({ each: true })
	@Type(() => MaskableFieldPartDto)
	maskedParts: MaskableFieldPartDto[];
}

export class AnchorDto  {
	@ApiProperty({
		description: 'Identifier of the virtual blockchain in which the data will be anchored. When omitted, a new virtual blockchain is created.'
	})
	@IsString()
	@IsOptional()
	virtualBlockchainId?: string;

	@ApiProperty({ type: [ChannelDto], description: 'List of created channels.' })
	@ValidateNested({ each: true })
	@Type(() => ChannelDto)
	channels: ChannelDto[];

	@ApiProperty({ type: [ActorDto], description: 'List of created actors.' })
	@ValidateNested({ each: true })
	@Type(() => ActorDto)
	actors: ActorDto[];

	@ApiProperty({ description: 'Data being anchored on chain.', type: Object, example: { "field1": "value1" } })
	@IsDefined()
	data: Object;

	@ApiProperty({ type: [ChannelAssignationDto], description: 'List of channel assignations.' })
	@ValidateNested({ each: true })
	@Type(() => ChannelAssignationDto)
	channelAssignations: ChannelAssignationDto[];

	@ApiProperty({ type: [ActorAssignationDto], description: 'List of actor assignations' })
	@ValidateNested({ each: true })
	@Type(() => ActorAssignationDto)
	actorAssignations: ActorAssignationDto[];

	@ApiProperty({ type: [HashableFieldDto], description: 'List of hashable fields.', default: [], example: [] })
	@ValidateNested({ each: true })
	@Type(() => HashableFieldDto)
	@IsOptional()
	hashableFields: HashableFieldDto[];

	@ApiProperty({ type: [MaskableFieldDto], description: 'List of maskable fields.', default: [], example: []  })
	@ValidateNested({ each: true })
	@Type(() => MaskableFieldDto)
	@IsOptional()
	maskableFields: MaskableFieldDto[];

	@ApiProperty({ description: 'Author', example: "Author" })
	@IsString()
	author: string

	isVirtualBlockchainIdDefined(): boolean {
		return this.virtualBlockchainId !== undefined;
	}

	getVirtualBlockchainId(): Optional<Hash> {
		if (this.isVirtualBlockchainIdDefined()) {
			return Optional.of(Hash.from(this.virtualBlockchainId));
		} else {
			return Optional.none();
		}
	}
}

export class AnchorWithWalletDto extends AnchorDto implements OperatorAnchorRequest {
	@ApiProperty({ description: 'Endorser', example: "Endorser" })
	@IsString()
	endorser: string;

	@ApiProperty({ description: 'Message displayed on the wallet.', example: 'This message is shown on the wallet.' })
	@IsString()
	approvalMessage: string;

}
