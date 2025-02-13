import { MiddlewareConsumer, Module } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './operator-api.gateway';
import { CorsMiddleware } from './cors-middleware';
import { OperatorApiController } from './operator-api.controller';
import { CryptoService } from './services/crypto.service';
import { EnvService } from '../services/env.service';
import { OrganisationService } from '../shared/services/organisation.service';
import { SharedModule } from '../shared/shared.module';

@Module({
	imports: [SharedModule],
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
