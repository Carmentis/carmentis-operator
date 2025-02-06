import { MiddlewareConsumer, Module } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './operator-api.gateway';
import { CorsMiddleware } from './cors-middleware';
import { OperatorApiController } from './operator-api.controller';
import { CryptoService } from './services/crypto.service';
import { EnvService } from './services/env.service';

@Module({
	imports: [],
	controllers: [OperatorApiController],
	providers: [PackageConfigService, OperatorApiGateway, CryptoService, EnvService],
})
export class OperatorApiModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorsMiddleware)
			.forRoutes('*');
	}
}
