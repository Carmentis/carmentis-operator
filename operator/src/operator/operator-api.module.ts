import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './operator-api.gateway';
import { CorsMiddleware } from './cors-middleware';
import { OperatorApiController } from './operator-api.controller';
import { CryptoService } from '../shared/services/crypto.service';
import { EnvService } from '../shared/services/env.service';
import { SharedModule } from '../shared/shared.module';
import { ApiKeyUsageMiddleware } from './middlewares/api-key-usage.middleware';
import { OperatorService } from './operator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnchorRequestEntity } from './entities/anchor-request.entity';
import { AnchorRequestService } from './services/anchor-request.service';

@Module({
	imports: [
		SharedModule,
		TypeOrmModule.forFeature([
			AnchorRequestEntity
		]),
	],
	controllers: [OperatorApiController],
	providers: [PackageConfigService, OperatorApiGateway, CryptoService, EnvService, OperatorService, AnchorRequestService],
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
