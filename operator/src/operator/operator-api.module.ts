import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './operator-api.gateway';
import { CorsMiddleware } from './cors-middleware';
import { OperatorApiController } from './operator-api.controller';
import { CryptoService } from '../shared/services/crypto.service';
import { EnvService } from '../shared/services/env.service';
import { SharedModule } from '../shared/shared.module';
import { ApiKeyUsageMiddleware } from './middlewares/api-key-usage.middleware';

@Module({
	imports: [SharedModule],
	controllers: [OperatorApiController],
	providers: [PackageConfigService, OperatorApiGateway, CryptoService, EnvService],
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
