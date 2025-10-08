import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OperatorApiGateway } from './gateways/OperatorApiGateway';
import { CorsMiddleware } from './middlewares/CorsMiddleware';
import { OperatorApiController } from './controllers/OperatorApiController';
import { CryptoService } from '../shared/services/CryptoService';
import { EnvService } from '../shared/services/EnvService';
import { SharedModule } from '../shared/SharedModule';
import { ApiKeyUsageMiddleware } from './middlewares/ApiKeyUsageMiddleware';
import { OperatorService } from './services/OperatorService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnchorRequestEntity } from './entities/AnchorRequestEntity';
import { AnchorRequestService } from './services/AnchorRequestService';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/ApiKeyGuard';
import { OperatorConfigModule } from '../config/OperatorConfigModule';
import { OperatorHealthApiController } from './controllers/OperatorHealthApiController';

@Module({
	imports: [
		OperatorConfigModule,
		SharedModule,
		TypeOrmModule.forFeature([
			AnchorRequestEntity
		]),

	],
	controllers: [OperatorApiController, OperatorHealthApiController],
	providers: [
		OperatorApiGateway,
		CryptoService,
		EnvService,
		OperatorService,
		AnchorRequestService,
		{
			provide: APP_GUARD,
			useClass: ApiKeyGuard,
		}
	],
})
export class OperatorApiModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorsMiddleware)
			.forRoutes('*');

		consumer
			.apply(ApiKeyUsageMiddleware)
			.forRoutes("/api/");
	}
}
