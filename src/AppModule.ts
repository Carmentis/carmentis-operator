import { Logger, MiddlewareConsumer, Module, NestModule, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatorApiModule } from './OperatorApiModule';
import { OperatorConfigModule } from './config/OperatorConfigModule';
import DataSourceOptions from './database/DataSourceOptions';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CryptoSignatureController } from './controllers/crypto/signature/CryptoSignatureController';
import { WalletCryptoController } from './controllers/wallet/WalletCryptoController';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from './services/EnvService';
import { OperatorConfigService } from './config/services/operator-config.service';
import { AnchorRequestEntity } from './entities/AnchorRequestEntity';
import { UserEntity } from './entities/UserEntity';
import { DeskAuthChallengeEntity } from './entities/DeskAuthChallengeEntity';
import { InvitationEntity } from './entities/InvitationEntity';
import { ApiKeyEntity } from './entities/ApiKeyEntity';
import { WalletEntity } from './entities/WalletEntity';
import { ApplicationEntity } from './entities/ApplicationEntity';
import { CryptoService } from './services/CryptoService';
import { WalletAnchoringRequestService } from './services/wallet-anchoring-request.service';
import { EncryptionService } from './services/EncryptionService';
import { ApiKeyService } from './services/ApiKeyService';
import { UserService } from './services/UserService';
import { ApplicationService } from './services/ApplicationService';
import { WalletService } from './services/WalletService';
import ChainService from './services/ChainService';
import { AnchorRequestService } from './services/AnchorRequestService';
import { DeskAuthChallengeService } from './services/DeskAuthChallengeService';
import { CarmentisDeskAuthService } from './services/CarmentisDeskAuthService';
import { InvitationService } from './services/InvitationService';
import { RegistrationService } from './services/RegistrationService';
import { APP_GUARD, HttpAdapterHost } from '@nestjs/core';
import { EncryptionServiceProxy } from './shared/transformers/EncryptionServiceProxy';
import { CorsMiddleware } from './middlewares/CorsMiddleware';
import { CryptoController } from './controllers/crypto/signature/CryptoController';
import { VerifiableCredentialController } from './controllers/VerifiableCredentialController';
import { WalletAnchoringController } from './controllers/wallet/WalletAnchoringController';
import { WalletRecordController } from './controllers/wallet/WalletRecordController';
import { HealthController } from './controllers/HealthController';
import { ProtocolWiapV1Controller } from './controllers/ProtocolWiapV1Controller';
import { AnchorRequestController } from './controllers/AnchorRequestController';
import { ChainController } from './controllers/ChainController';
import { WalletProofController } from './controllers/wallet/WalletProofController';
import { AuthGuard } from './guards/AuthGuard';
import { SameOriginGuard } from './guards/SameOriginGuard';
import { PrivateKeyService } from './services/PrivateKeyService';
import { JsonSignatureService } from './services/JsonSignatureService';
import { PrivateKeyEntity } from './entities/PrivateKeyEntity';
import { WalletByIdPipe } from './pipes/WalletByIdPipe';
import { ExtractPrivateSignatureKeyFromWallet } from './pipes/ExtractPrivateSignatureKeyFromWallet';
import { ExtractPublicSignatureKeyFromWallet } from './pipes/ExtractPublicSignatureKeyFromWallet';
import { AuthTokenService } from './services/AuthTokenService';
import { OperatorAdminUiAuthController } from './controllers/operator-admin-ui/OperatorAdminUiAuthController';
import { OperatorAdminUiSetupController } from './controllers/operator-admin-ui/OperatorAdminUiSetupController';
import { OperatorAdminUiInvitationController } from './controllers/operator-admin-ui/OperatorAdminUiInvitationController';
import { OperatorAdminUiAccountController } from './controllers/operator-admin-ui/OperatorAdminUiAccountController';
import { OperatorAdminUiDashboardController } from './controllers/operator-admin-ui/OperatorAdminUiDashboardController';
import { OperatorAdminUiWalletController } from './controllers/operator-admin-ui/OperatorAdminUiWalletController';
import { OperatorAdminUiApplicationController } from './controllers/operator-admin-ui/OperatorAdminUiApplicationController';
import { OperatorAdminUiUserController } from './controllers/operator-admin-ui/OperatorAdminUiUserController';
import { OperatorAdminUiApiKeyController } from './controllers/operator-admin-ui/OperatorAdminUiApiKeyController';
import { HomeController } from './controllers/HomeController';

@Module({
	imports: [
		OperatorConfigModule,
		JwtModule.registerAsync({
			imports: [OperatorConfigModule],
			inject: [EnvService, OperatorConfigService],
			useFactory: async (envService: EnvService, config: OperatorConfigService) => ({
				secret: await envService.getOrCreateJwtSecret(),
				signOptions: { expiresIn: config.getJwtTokenValidity() },
			}),
		}),
		TypeOrmModule.forFeature([
			AnchorRequestEntity,
			UserEntity,
			DeskAuthChallengeEntity,
			InvitationEntity,
			ApiKeyEntity,
			WalletEntity,
			PrivateKeyEntity,
			ApplicationEntity,
		]),
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000,
					limit: 1000,
				},
			],
		}),
		TypeOrmModule.forRoot(DataSourceOptions),
	],
	providers: [
		// services
		CryptoService,
		EnvService,
		WalletAnchoringRequestService,
		EncryptionService,
		ApiKeyService,
		UserService,
		ApplicationService,
		WalletService,
		PrivateKeyService,
		JsonSignatureService,
		ChainService,
		AnchorRequestService,
		DeskAuthChallengeService,
		CarmentisDeskAuthService,
		InvitationService,
		RegistrationService,
		AuthTokenService,

		// pipes
		WalletByIdPipe,
		ExtractPrivateSignatureKeyFromWallet,
		ExtractPublicSignatureKeyFromWallet,

		// guards & interceptors
		{
			provide: APP_GUARD,
			useClass: SameOriginGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
	controllers: [
		HomeController,
		// admin UI controllers
		OperatorAdminUiAuthController,
		OperatorAdminUiSetupController,
		OperatorAdminUiInvitationController,
		OperatorAdminUiAccountController,
		OperatorAdminUiWalletController,
		OperatorAdminUiApplicationController,
		OperatorAdminUiUserController,
		OperatorAdminUiApiKeyController,
		OperatorAdminUiDashboardController,

		// additional controllers
		ChainController,
		ProtocolWiapV1Controller,
		AnchorRequestController,
		HealthController,
		WalletProofController,
		WalletRecordController,
		WalletAnchoringController,
		VerifiableCredentialController,
		CryptoController,
		CryptoSignatureController,
		WalletCryptoController
	]
})
export class AppModule implements NestModule, OnApplicationBootstrap {
	private logger = new Logger();

	constructor(
		private readonly encryptionService: EncryptionService,
		private readonly config: OperatorConfigService,
		private readonly httpAdapterHost: HttpAdapterHost,
	) {}

	onApplicationBootstrap() {
		const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer();
		const address = httpServer.address();

		const port =
			typeof address === "object" && address !== null
				? address.port
				: 3000;
		const sep = "-------------------------------------------------"
		this.logger.log([
			"Operator is running, displaying welcome message",
			sep,
			"The Operator server is running, you can now configure it at:",
			`http://localhost:${port}`,
			sep
		].join("\n"));
    }

	onModuleInit() {
		EncryptionServiceProxy.setInstance(this.encryptionService);
	}

	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorsMiddleware)
			.forRoutes('*');

	}
}
