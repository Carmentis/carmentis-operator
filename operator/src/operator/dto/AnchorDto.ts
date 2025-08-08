import { IsBoolean, IsDefined, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CMTSToken, Hash, OperatorAnchorRequest, Optional } from '@cmts-dev/carmentis-sdk/server';

export class ChannelDto {
	@ApiProperty({ title: 'Name of the channel' })
	@IsString()
	name: string;

	@ApiProperty({ title: "Channel visibility", description: 'Indicates whether the channel is public or private' })
	@IsBoolean()
	public: boolean;
}

export class ActorDto {
	@ApiProperty({ title: 'Name of the actor.', example: "Endorser" })
	@IsString()
	name: string;

	@ApiProperty({
		title: 'Public key of the actor.',
		description: "This field is used to indicate that a public key should be associated to a specific actor",
		nullable: true
	})
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

	@ApiProperty({
		type: [ActorDto],
		title: "List of actors to create.",
		description: 'This field contains all actors that need to be created to be used in transactions.',
	})
	@ValidateNested({ each: true })
	@Type(() => ActorDto)
	actors: ActorDto[];

	@ApiProperty({
		title: "Data being anchored on chain.",
		description: 'This field contains all your own business-related data being anchored in the blockchain.',
		type: Object,
		example: { "field1": "value1" }
	})
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

	@ApiProperty({
		title: "Author",
		description: 'The author of a transaction corresponds to the actor having initiated the transaction (mostly your application server).',
		example: "MyApplication"
	})
	@IsString()
	author: string

	@ApiProperty({
		description: 'Gas price used to perform the transaction. Gas price should be atomic. When omitted, one CMTS is used as a gas price. For more information, see CMTSToken.',
		example: CMTSToken.oneCMTS().getAmountAsAtomic(),
		type: Number,
		title: "Gas price (in atomic).",
		nullable: true
	})
	@IsPositive({ message: 'Gas price must be positive.' })
	gasPriceInAtomic?: number;



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
