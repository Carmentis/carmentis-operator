import { MiddlewareConsumer, Module } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './operator-api.gateway';
import { CorsMiddleware } from './cors-middleware';

@Module({
	imports: [],
	controllers: [],
	providers: [PackageConfigService, OperatorApiGateway],
})
export class OperatorApiModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CorsMiddleware)
			.forRoutes('*');
	}
}
