import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum BinaryEncoding {
	HEX = 'hex',
	BASE64 = 'base64',
	BASE64URL = 'base64url'
}

// Méthodes de transformation JSON -> binaire avant vérification de signature.
// Une seule valeur pour l'instant, mais l'enum permet d'en ajouter sans
// changer la forme du DTO ni casser les clients existants.
export enum JsonCanonicalizationMethod {
	JSON_CANONICAL = 'json-canonical',
}

// --- Base commune ---
export abstract class BaseSignatureVerificationDto {
	@IsString()
	@IsNotEmpty()
	signature: string;

	@IsString()
	@IsNotEmpty()
	publicKey: string;

	@IsOptional()
	@IsEnum(BinaryEncoding)
	signatureEncoding: BinaryEncoding = BinaryEncoding.HEX;
}

// --- Cas 1 : message = chaîne binaire encodée (hex/base64) ---
export class BinaryMessageSignatureVerificationDto extends BaseSignatureVerificationDto {
	@IsString()
	@IsNotEmpty()
	message: string;

	@IsOptional()
	@IsEnum(BinaryEncoding)
	messageEncoding: BinaryEncoding = BinaryEncoding.HEX;
}

// --- Cas 2 : message = objet JSON à canonicaliser (JCS / RFC 8785) ---
export class JsonMessageSignatureVerificationDto extends BaseSignatureVerificationDto {
	@IsObject()
	@IsNotEmpty()
	message: unknown;


	@IsOptional()
	@IsEnum(JsonCanonicalizationMethod)
	canonicalizationMethod: JsonCanonicalizationMethod =
		JsonCanonicalizationMethod.JSON_CANONICAL;
}