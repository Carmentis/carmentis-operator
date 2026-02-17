import {
	Body,
	Controller,
	Logger,
	Post,
	UnauthorizedException,
} from '@nestjs/common';
import {
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../decorators/PublicDecorator';
import { ChallengeService } from '../../services/ChallengeService';
import { UserService } from '../../services/UserService';
import { ChallengeResponseDto } from '../../dto/ChallengeResponseDto';
import { VerifyChallengeDto } from '../../dto/VerifyChallengeDto';
import { JwtTokenResponseDto } from '../../dto/JwtTokenResponseDto';
import { JwtService } from '@nestjs/jwt';
import { CryptoEncoderFactory, PublicSignatureKey } from '@cmts-dev/carmentis-sdk/server';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';

/**
 * Controller for handling operator admin authentication via challenge-response mechanism
 * Provides stateless authentication using MAC (Message Authentication Code) for challenge validation
 */
@ApiTags('Admin Authentication using Wallet Challenge-Response Mechanism')
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/login/wallet`)
export class OperatorAdminApiLoginController {
	private logger = new Logger(OperatorAdminApiLoginController.name);

	constructor(
		private readonly challengeService: ChallengeService,
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Generates a cryptographic challenge for authentication
	 * The challenge includes a MAC (Message Authentication Code) to ensure authenticity and prevent tampering
	 * The challenge is valid for a limited time (5 minutes by default)
	 *
	 * @returns Challenge object containing the challenge string, MAC, and expiration time
	 */
	@Public()
	@Post('/challenge')
	@ApiOperation({
		summary: 'Generate authentication challenge',
		description: 'Creates a new challenge with MAC authentication for stateless challenge-response authentication. The challenge expires after 5 minutes.',
	})
	@ApiResponse({
		status: 201,
		description: 'Challenge generated successfully',
		type: ChallengeResponseDto,
	})
	async login(): Promise<ChallengeResponseDto> {
		this.logger.debug('Generating new authentication challenge');

		const challengeData = this.challengeService.generateChallenge();

		return {
			challenge: challengeData.challenge,
			mac: challengeData.mac,
			expiresAt: challengeData.expiresAt.toISOString(),
		};
	}

	/**
	 * Verifies a signed challenge and issues a JWT token upon successful authentication
	 *
	 * The verification process:
	 * 1. Validates the MAC to ensure the challenge was issued by this server and hasn't been tampered with
	 * 2. Checks that the challenge hasn't expired
	 * 3. Verifies the signature using the provided public key
	 * 4. Confirms the user exists in the system
	 * 5. Issues a JWT token for authenticated access
	 *
	 * @param verifyChallengeDto Challenge verification data including challenge, public key, signature, and MAC
	 * @returns JWT token with expiration time
	 * @throws UnauthorizedException if verification fails at any step
	 */
	@Public()
	@Post('/verify')
	@ApiOperation({
		summary: 'Verify challenge and obtain JWT token',
		description: 'Verifies a signed challenge using the MAC for authenticity, validates the signature, and returns a JWT token for authenticated access.',
	})
	@ApiResponse({
		status: 201,
		description: 'Challenge verified successfully, JWT token issued',
		type: JwtTokenResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Challenge verification failed - invalid MAC, expired challenge, invalid signature, or user not found',
	})
	async verify(@Body() verifyChallengeDto: VerifyChallengeDto): Promise<JwtTokenResponseDto> {
		try {
			this.logger.debug(`Verifying challenge for public key: ${verifyChallengeDto.publicKey}`);

			// Step 1: Verify challenge authenticity and validity using MAC
			const expiresAt = new Date(verifyChallengeDto.expiresAt);
			this.challengeService.verifyChallenge(
				verifyChallengeDto.challenge,
				verifyChallengeDto.mac,
				expiresAt,
			);

			// Step 2: Verify the signature
			const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
			const publicKey = await encoder.decodePublicKey(verifyChallengeDto.publicKey);
			const challengeBytes = Buffer.from(verifyChallengeDto.challenge, 'hex');
			const signatureBytes = Buffer.from(verifyChallengeDto.signature, 'hex');

			const isValidSignature = publicKey.verify(challengeBytes, signatureBytes);

			if (!isValidSignature) {
				this.logger.warn(`Invalid signature for public key: ${verifyChallengeDto.publicKey}`);
				throw new UnauthorizedException('Invalid signature');
			}

			// Step 3: Verify user exists
			const user = await this.userService.findUserByPublicKey(verifyChallengeDto.publicKey);
			if (!user) {
				this.logger.warn(`User not found for public key: ${verifyChallengeDto.publicKey}`);
				throw new UnauthorizedException('User not found');
			}

			// Step 4: Generate JWT token
			const payload = { publicKey: user.publicKey, pseudo: user.pseudo };
			const token = this.jwtService.sign(payload);

			// Calculate token expiration (default 8 hours from JWT config)
			const tokenExpiresAt = new Date();
			tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 8);

			this.logger.debug(`JWT token issued for user: ${user.pseudo}`);

			return {
				token,
				expiresAt: tokenExpiresAt.toISOString(),
			};
		} catch (error) {
			console.error(error)
			this.logger.error(`Challenge verification failed: ${error.message}`);
			throw new UnauthorizedException(error.message);
		}
	}
}
