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

/**
 * Supported verifiable credential formats
 */
export enum VerifiableCredentialFormat {
	/** Standard JWT-based Verifiable Credential format */
	JWT_VC = 'jwt_vc',
	/** Selective Disclosure JWT Verifiable Credential format (RFC 9285) */
	SD_JWT_VC = 'vc+sd-jwt',
	// Future formats: 'ldp_vc', 'mso_mdoc', etc.
}

/** Regular expression for DID validation: did:<method>:<method-specific-id> */
const DID_REGEX = /^did:[a-z0-9]+:.+$/;

/**
 * Represents a specific claim path that should be checked in a credential.
 * Used to verify that certain claims are disclosed (in selective disclosure credentials).
 */
export class RequestedClaimDto {
	@ApiProperty({
		description: 'Path of the requested claim using dot-notation or JSON pointer syntax (e.g. "email", "address.street")',
		example: 'email',
	})
	@IsString()
	path: string;
}

/**
 * Request DTO for verifying a selective disclosure JWT verifiable credential (SD-JWT-VC).
 * Supports validation of credential signature, issuer trust, required claims, and credential status.
 *
 * @example
 * {
 *   "credential": "eyJhbGciOiJFZERTQSIsInR5cCI6InZjK3NkLWp3dCJ9...",
 *   "allowedFormats": ["vc+sd-jwt"],
 *   "trustedIssuers": ["did:web:issuer.example.com"],
 *   "requiredClaimKeys": ["email", "name"],
 *   "expectedSubject": "did:key:z6MkhaXgBZDvotDkL5257faWxcqDy2Kwp5l0EQ3SL7AEm57D"
 * }
 */
export class SdJwtVerifiableCredentialVerificationRequestDto {
	@ApiProperty({
		description: 'The credential to verify. For SD-JWT-VC format, this should be a compact JWT string with disclosures and optional key binding JWT separated by tilde (~) characters',
		example: 'eyJhbGciOiJFZERTQSIsInR5cCI6InZjK3NkLWp3dCJ9.eyJpc3MiOiJkaWQ6d2ViOmZvby5iYXIiLCJzdWIiOiJkaWQ6a2V5On...',
	})
	@IsDefined()
	credential: unknown;

	@ApiPropertyOptional({
		description: 'List of acceptable credential formats. If omitted, format is automatically inferred. Useful for strict validation of credential format',
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

	@ApiPropertyOptional({
		description: 'List of trusted issuer DIDs. If specified, the credential issuer must be one of these DIDs. If empty, all issuers are accepted',
		isArray: true,
		example: ['did:web:issuer.example.com', 'did:key:z6MkhaXgBZDvotDkL5257faWxcqDy2Kwp5l0EQ3SL7AEm57D'],
	})
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayUnique()
	@Matches(DID_REGEX, { each: true, message: 'Each issuer must be a valid DID (did:<method>:<id>)' })
	trustedIssuers?: string[];

	@ApiPropertyOptional({
		description: 'List of claim names that must be disclosed in the credential. Used for SD-JWT credentials to ensure specific claims are present. Verification will fail if any required claim is missing or undisclosed',
		type: [String],
		example: ['email', 'name', 'phone_number'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	requiredClaimKeys?: string[];

	@ApiPropertyOptional({
		description: 'The expected subject DID. If provided, the credential subject must match this value. Used to prevent credential substitution attacks',
		example: 'did:key:z6MkhaXgBZDvotDkL5257faWxcqDy2Kwp5l0EQ3SL7AEm57D',
	})
	@IsOptional()
	@IsString()
	expectedSubject?: string;

	@ApiPropertyOptional({
		description: 'If true, skips verification of the credential status (e.g., revocation status). Use only when status verification is not applicable',
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	disableStatusVerification?: boolean = false;
}


/**
 * Request DTO for verifying a selective disclosure JWT verifiable presentation (SD-JWT-VP).
 * Extends credential verification with key binding validation using a nonce.
 * The key binding proves that the presentation holder possesses the private key corresponding to the subject DID.
 */
export class SdJwtVerifiablePresentationVerificationRequestDto extends SdJwtVerifiableCredentialVerificationRequestDto {
	@ApiPropertyOptional({
		description: 'Nonce value used in the key binding JWT to prevent replay attacks. The key binding must sign this exact nonce value',
		example: '3e0b0613a74fd01038ffc680db00fd58',
	})
	@IsString()
	nonce: string;
}