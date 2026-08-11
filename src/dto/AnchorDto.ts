import {
	IsBoolean,
	IsDefined,
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CMTSToken, Hash, Optional } from '@cmts-dev/carmentis-sdk-core';

/**
 * Represents a channel in which data can be organized and visibility controlled.
 * Channels allow selective disclosure of data to different actors.
 */
export class ChannelDto {
	@ApiProperty({
		title: 'Name of the channel',
		description: 'Unique identifier for this channel within the virtual blockchain',
		example: 'Public_Data'
	})
	@IsString()
	name: string;

	@ApiProperty({
		title: "Channel visibility",
		description: 'Indicates whether the channel is public (visible to all) or private (visible only to authorized actors)',
		example: true
	})
	@IsBoolean()
	public: boolean;
}

/**
 * Represents an actor (participant) in a virtual blockchain transaction.
 * Actors can have different roles and permissions within the blockchain.
 */
export class ActorDto {
	@ApiProperty({
		title: 'Name of the actor',
		description: 'Identifier for this actor within the virtual blockchain. Used in authorizations and endorsements',
		example: "Endorser"
	})
	@IsString()
	name: string;
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

/**
 * Request DTO for anchoring data to a Carmentis virtual blockchain.
 * Contains all necessary information to create a transaction with optional wallet approval.
 *
 * @example
 * {
 *   "applicationId": "app123",
 *   "channels": [{ "name": "Public", "public": true }],
 *   "actors": [{ "name": "Endorser" }],
 *   "data": { "invoice": "INV-001", "amount": "1000" },
 *   "author": "MyApplication"
 * }
 */
export class AnchorDto  {
	@ApiProperty({
		description: 'Identifier of the application virtual blockchain. ' +
			'The application must be published online before calling this endpoint.' +
			'When omitted, either a wallet or an application must be associated with the API key.',
		example: '6AC2A4EBFD08F34C2EF4432041313F83EB4C8AB9154FAEF61ABB833613DA1C10',
		required: false,
	})
	@IsOptional()
	@IsString()
	applicationId?: string;

	@ApiProperty({
		description: 'Identifier of the target application ledger. If omitted, a new virtual blockchain is created for this anchor request',
		example: '82A49C89ACA5F3ECA4139A040A028B4C5B0A686BC1CE4B58DDE1BFC6B1004FBD',
		required: false
	})
	@IsString()
	@IsOptional()
	virtualBlockchainId?: string;

	@ApiProperty({
		description: 'Retention period in days for the anchored data on the Carmentis blockchain. After this period, data may be archived or removed. Required only for the first microblock of the virtual blockchain.',
		example: 360,
		required: false
	})
	@IsNumber()
	@IsOptional()
	@IsInt()
	@IsPositive()
	chainStorageInDays?: number;

	@ApiProperty({
		description: 'Gas price in atomic units to use for the anchoring transaction. If limits are defined in the API key, then the gas price must be within theses limits (gasMinAtomics - gasMaxAtomics)',
		example: 100000,
	})
	@IsNumber()
	@IsPositive()
	@IsInt()
	gasPriceInAtomics: number;

	@ApiProperty({
		type: [ChannelDto],
		description: 'List of channels to create in this virtual blockchain. Each channel controls data visibility to different actors',
		example: [{ name: 'Public', public: true }, { name: 'Private', public: false }]
	})
	@ValidateNested({ each: true })
	@Type(() => ChannelDto)
	channels: ChannelDto[];

	@ApiProperty({
		type: [ActorDto],
		title: "List of actors to create",
		description: 'All participants/actors that need to be created and used in this transaction',
		example: [{ name: 'Endorser' }, { name: 'Witness' }]
	})
	@ValidateNested({ each: true })
	@Type(() => ActorDto)
	actors: ActorDto[];

	@ApiProperty({
		title: "Data being anchored on chain",
		description: 'Your business-related data to be anchored. This is the actual payload being recorded on the blockchain',
		type: Object,
		example: { "invoice_id": "INV-001", "amount": 1000, "customer": "ACME Corp" }
	})
	@IsDefined()
	data: Object;

	@ApiProperty({
		type: [ChannelAssignationDto],
		description: 'Assignment of data fields to specific channels. Controls which actors can see which data',
		example: [{ channelName: 'Public', fieldPath: 'invoice_id' }]
	})
	@ValidateNested({ each: true })
	@Type(() => ChannelAssignationDto)
	channelAssignations: ChannelAssignationDto[];

	@ApiProperty({
		type: [ActorAssignationDto],
		description: 'Assignment of channel visibility to specific actors',
		example: [{ channelName: 'Public', actorName: 'Endorser' }]
	})
	@ValidateNested({ each: true })
	@Type(() => ActorAssignationDto)
	actorAssignations: ActorAssignationDto[];

	@ApiProperty({
		type: [HashableFieldDto],
		description: 'Fields whose values should be hashed for zero-knowledge proofs',
		default: [],
		required: false,
		example: []
	})
	@ValidateNested({ each: true })
	@Type(() => HashableFieldDto)
	@IsOptional()
	hashableFields: HashableFieldDto[] = [];

	@ApiProperty({
		type: [MaskableFieldDto],
		description: 'Fields that support masking (redaction) of specific parts. Useful for PII and sensitive data',
		default: [],
		example: [],
	})
	@ValidateNested({ each: true })
	@Type(() => MaskableFieldDto)
	@IsOptional()
	maskableFields: MaskableFieldDto[]  = [];

	@ApiProperty({
		title: "Author",
		description: 'The actor who initiated this transaction. Usually your application server or user identity',
		example: "MyApplication"
	})
	@IsString()
	author: string
}

/**
 * Extended anchor DTO for transactions requiring wallet approval.
 * Includes additional fields for user confirmation and endorsement flows.
 */
export class AnchorWithWalletDto extends AnchorDto {
	@ApiProperty({
		description: 'The actor who endorses/approves this transaction. Often a human user or trusted service',
		example: "Endorser"
	})
	@IsString()
	endorser: string;

	@ApiProperty({
		description: 'User-facing message displayed on the wallet during approval. Helps users understand what they are approving',
		example: 'Please approve the anchoring of invoice INV-001 for $1000'
	})
	@IsString()
	approvalMessage: string;
}
