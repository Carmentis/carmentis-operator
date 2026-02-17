import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OperatorApiGateway } from './gateways/OperatorApiGateway';
import { CorsMiddleware } from './middlewares/CorsMiddleware';
import { OperatorApiController } from './controllers/operator-api/OperatorApiController';
import { CryptoService } from './services/CryptoService';
import { EnvService } from './services/EnvService';
import { WalletAnchoringRequestService } from './services/wallet-anchoring-request.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnchorRequestEntity } from './entities/AnchorRequestEntity';
import { AnchorRequestService } from './services/AnchorRequestService';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/ApiKeyGuard';
import { OperatorConfigModule } from './config/OperatorConfigModule';
import { OperatorHealthApiController } from './controllers/operator-api/OperatorHealthApiController';
import { EncryptionService } from './services/EncryptionService';
import { ApiKeyService } from './services/ApiKeyService';
import { UserService } from './services/UserService';
import { ApplicationService } from './services/ApplicationService';
import ChainService from './services/ChainService';
import { EncryptionServiceProxy } from './shared/transformers/EncryptionServiceProxy';
import { UserEntity } from './entities/UserEntity';
import { ApiKeyEntity } from './entities/ApiKeyEntity';
import { WalletEntity } from './entities/WalletEntity';
import { ApplicationEntity } from './entities/ApplicationEntity';
import { OperatorAdminApiLoginController } from './controllers/operator-admin-api/OperatorAdminApiLoginController';
import { ChallengeService } from './services/ChallengeService';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { OperatorAdminApiUserController } from './controllers/operator-admin-api/OperatorAdminApiUserController';
import {
	OperatorAdminApiApplicationController
} from './controllers/operator-admin-api/OperatorAdminApiApplicationController';
import { OperatorAdminApiWalletController } from './controllers/operator-admin-api/OperatorAdminApiWalletController';
import { OperatorAdminApiApiKeyController } from './controllers/operator-admin-api/OperatorAdminApiApiKeyController';
import { OperatorAdminApiSetupController } from './controllers/operator-admin-api/OperatorAdminApiSetupController';
import { OperatorConfigService } from './config/services/operator-config.service';

@Module({
	imports: [
		OperatorConfigModule,
		JwtModule.registerAsync({
			useFactory: (config: OperatorConfigService) => ({
				secret: config.getJwtSecret(),
				signOptions: { expiresIn: config.getJwtTokenValidity() },
			}),
		}),
		TypeOrmModule.forFeature([
			AnchorRequestEntity,
			UserEntity,
			ApiKeyEntity,
			WalletEntity,
			ApplicationEntity,
		]),

	],
	controllers: [
		OperatorAdminApiSetupController,
		OperatorAdminApiApiKeyController,
		OperatorApiController,
		OperatorHealthApiController,
		OperatorAdminApiLoginController,
		OperatorAdminApiUserController,
		OperatorAdminApiApplicationController,
		OperatorAdminApiWalletController,
	],
	providers: [
		OperatorApiGateway,
		CryptoService,
		EnvService,
		WalletAnchoringRequestService,
		EncryptionService,
		CryptoService,
		ApiKeyService,
		UserService,
		ApplicationService,
		ChainService,
		AnchorRequestService,
		ChallengeService,
		{
			provide: APP_GUARD,
			useClass: ApiKeyGuard,
		}
	],
})
export class OperatorApiModule implements NestModule {


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
