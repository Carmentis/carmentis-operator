import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { ApiKeyEntity } from './entities/ApiKeyEntity';
import { WalletEntity } from './entities/WalletEntity';
import { ApplicationEntity } from './entities/ApplicationEntity';
import { OperatorAdminApiSetupController } from './controllers/operator-admin-api/OperatorAdminApiSetupController';
import { OperatorAdminApiApiKeyController } from './controllers/operator-admin-api/OperatorAdminApiApiKeyController';
import { OperatorAdminApiLoginController } from './controllers/operator-admin-api/OperatorAdminApiLoginController';
import { OperatorAdminApiUserController } from './controllers/operator-admin-api/OperatorAdminApiUserController';
import {
	OperatorAdminApiApplicationController
} from './controllers/operator-admin-api/OperatorAdminApiApplicationController';
import { OperatorAdminApiWalletController } from './controllers/operator-admin-api/OperatorAdminApiWalletController';
import { CryptoService } from './services/CryptoService';
import { WalletAnchoringRequestService } from './services/wallet-anchoring-request.service';
import { EncryptionService } from './services/EncryptionService';
import { ApiKeyService } from './services/ApiKeyService';
import { UserService } from './services/UserService';
import { ApplicationService } from './services/ApplicationService';
import { WalletService } from './services/WalletService';
import ChainService from './services/ChainService';
import { AnchorRequestService } from './services/AnchorRequestService';
import { ChallengeService } from './services/ChallengeService';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiKeyGuard } from './guards/ApiKeyGuard';
import { JwtTokenBearerGuard } from './guards/JwtTokenBearerGuard';
import { CrudRequestInterceptor } from '@dataui/crud';
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

@Module({
	imports: [
		OperatorConfigModule,
		JwtModule.registerAsync({
			imports: [OperatorConfigModule],
			useFactory: async (envService: EnvService, config: OperatorConfigService) => ({
				secret: await envService.getOrCreateJwtSecret(),
				signOptions: { expiresIn: config.getJwtTokenValidity() },
			}),
			inject: [EnvService, OperatorConfigService],
		}),
		TypeOrmModule.forFeature([
			AnchorRequestEntity,
			UserEntity,
			ApiKeyEntity,
			WalletEntity,
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
		CryptoService,
		EnvService,
		WalletAnchoringRequestService,
		EncryptionService,
		CryptoService,
		ApiKeyService,
		UserService,
		ApplicationService,
		WalletService,
		ChainService,
		AnchorRequestService,
		ChallengeService,
		/*
		{
			provide: APP_GUARD,
			useClass: ApiKeyGuard,
		},
		{
			provide: APP_GUARD,
			useClass: JwtTokenBearerGuard,
		},

		 */
		{
			provide: APP_INTERCEPTOR,
			useClass: CrudRequestInterceptor,
		}
	],
	controllers: [
		// admin controllers
		OperatorAdminApiSetupController,
		OperatorAdminApiApiKeyController,
		OperatorAdminApiLoginController,
		OperatorAdminApiUserController,
		OperatorAdminApiApplicationController,
		OperatorAdminApiWalletController,

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
export class AppModule implements NestModule {

	constructor(private readonly encryptionService: EncryptionService) {}

	onModuleInit() {
		EncryptionServiceProxy.setInstance(this.encryptionService);
	}

	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorsMiddleware)
			.forRoutes('*');

	}
}
