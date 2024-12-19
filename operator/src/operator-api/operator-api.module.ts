import { MiddlewareConsumer, Module } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './operator-api.gateway';
import { OperatorApiController } from './operator-api.controller';
import { CorsMiddleware } from './cors-middleware';

@Module({
	imports: [],
	controllers: [OperatorApiController],
	providers: [PackageConfigService, OperatorApiGateway],
})
export class OperatorApiModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorsMiddleware)
			.forRoutes('*');
	}
}
