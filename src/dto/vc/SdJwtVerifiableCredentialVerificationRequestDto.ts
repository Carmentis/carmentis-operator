import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	ArrayUnique,
	IsArray, IsBoolean,
	IsDefined,
	IsEnum,
	IsOptional,
	IsString,
	Matches,
	ValidateNested,
} from 'class-validator';

export enum VerifiableCredentialFormat {
	JWT_VC = 'jwt_vc',
	SD_JWT_VC = 'vc+sd-jwt',
	// Future formats: 'ldp_vc', 'mso_mdoc', etc.
}

// did:<method>:<method-specific-id>
const DID_REGEX = /^did:[a-z0-9]+:.+$/;

export class RequestedClaimDto {
	@ApiProperty({
		description: 'Path of the requested claim (e.g. JSON pointer or dot-path notation, per internal convention)',
		example: 'credentialSubject.givenName',
	})
	@IsString()
	path: string;
}

export class SdJwtVerifiableCredentialVerificationRequestDto {
	@ApiProperty({
		description:
			'The credential to verify, shape depending on the format (compact JWT string, JSON object, etc.). The exact type is determined at the application level.',
		example: 'eyJhbGciOiJFUzI1NksifQ...~WyJzYWx0IiwibmFtZSIsIkpvaG4iXQ...~',
	})
	@IsDefined()
	credential: unknown;

	@ApiPropertyOptional({
		description:
			'Restricts verification to the listed formats. If omitted, the format is automatically inferred from the credential.',
		enum: VerifiableCredentialFormat,
		isArray: true,
		example: [VerifiableCredentialFormat.SD_JWT_VC],
	})
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayUnique()
	@IsEnum(VerifiableCredentialFormat, { each: true })
	allowedFormats?: VerifiableCredentialFormat[];

	@ApiProperty({
		description: 'List of trusted issuer DIDs allowed to have issued this credential',
		isArray: true,
		example: ['did:web:issuer.example.com', 'did:key:z6Mk...'],
	})
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayUnique()
	@Matches(DID_REGEX, { each: true, message: 'Each issuer must be a valid DID (did:<method>:<id>)' })
	trustedIssuers?: string[];

	@ApiPropertyOptional({
		description: 'Required claim keys that must be present in the credential payload',
		type: [String],
		example: ['email', 'name'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	requiredClaimKeys?: string[];

	@ApiPropertyOptional({
		description: 'The expected subject of the credential',
	})
	@IsOptional()
	@IsString()
	expectedSubject?: string;

	@ApiPropertyOptional({
		description: 'Disable status verification of the credential',
	})
	@IsOptional()
	@IsBoolean()
	disableStatusVerification?: boolean = false;
}


export class SdJwtVerifiablePresentationVerificationRequestDto extends SdJwtVerifiableCredentialVerificationRequestDto {
	@ApiPropertyOptional({
		description: 'Nonce used for the key binding.',
		example: '3e0b0613a74fd01038ffc680db00fd58',
	})
	@IsString()
	nonce: string;
}