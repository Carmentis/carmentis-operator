import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { CurrentAdminUser } from '../../decorators/CurrentAdminUserDecorator';
import { WebauthnResponseDto } from '../../dto/WebauthnResponseDto';
import { RenamePasskeyDto } from '../../dto/RenamePasskeyDto';
import { WebauthnService } from '../../services/WebauthnService';
import { PasskeyService } from '../../services/PasskeyService';
import { AdminJwtPayload } from '../../services/AuthTokenService';

@Controller(`${OPERATOR_ADMIN_API_PREFIX}/passkeys`)
export class OperatorAdminApiPasskeyController {
	constructor(
		private readonly webauthnService: WebauthnService,
		private readonly passkeyService: PasskeyService,
	) {}

	@Get()
	async list(@CurrentAdminUser() currentUser: AdminJwtPayload) {
		const credentials = await this.passkeyService.listForUser(currentUser.sub);
		return credentials.map((credential) => ({
			id: credential.id,
			name: credential.name ?? null,
			deviceType: credential.deviceType ?? null,
			backedUp: credential.backedUp,
			createdAt: credential.createdAt,
			lastUsedAt: credential.lastUsedAt ?? null,
		}));
	}

	/** Begins registration of an additional passkey for the already-authenticated user. */
	@Post('options')
	async options(@CurrentAdminUser() currentUser: AdminJwtPayload) {
		const existing = await this.passkeyService.listForUser(currentUser.sub);
		return this.webauthnService.beginRegistration({
			userName: currentUser.pseudo,
			userDisplayName: currentUser.pseudo,
			userId: currentUser.sub,
			excludeCredentials: existing.map((credential) => ({
				id: credential.credentialId,
				transports: credential.transports,
			})),
		});
	}

	@Post('verify')
	async verify(@CurrentAdminUser() currentUser: AdminJwtPayload, @Body() dto: WebauthnResponseDto) {
		const result = await this.webauthnService.finishRegistration(dto.response as any);
		if (result.challengeRow.userId !== currentUser.sub) {
			// Defensive: the challenge was not the one issued for this authenticated user.
			throw new BadRequestException('Challenge/user mismatch');
		}
		const credential = await this.passkeyService.createForUser({
			userId: currentUser.sub,
			credentialId: result.credentialId,
			publicKey: result.publicKey,
			counter: result.counter,
			transports: result.transports,
			deviceType: result.deviceType,
			backedUp: result.backedUp,
		});
		return { id: credential.id };
	}

	@Patch(':id')
	async rename(
		@CurrentAdminUser() currentUser: AdminJwtPayload,
		@Param('id') id: string,
		@Body() dto: RenamePasskeyDto,
	) {
		const credential = await this.passkeyService.rename(currentUser.sub, id, dto.name);
		return { id: credential.id, name: credential.name };
	}

	@Delete(':id')
	async remove(@CurrentAdminUser() currentUser: AdminJwtPayload, @Param('id') id: string) {
		await this.passkeyService.remove(currentUser.sub, id);
		return { success: true };
	}
}
