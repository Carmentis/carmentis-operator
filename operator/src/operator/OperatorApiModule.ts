import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { OperatorApiGateway } from './OperatorApiGateway';
import { CorsMiddleware } from './CorsMiddleware';
import { OperatorApiController } from './controllers/OperatorApiController';
import { CryptoService } from '../shared/services/CryptoService';
import { EnvService } from '../shared/services/EnvService';
import { SharedModule } from '../shared/SharedModule';
import { ApiKeyUsageMiddleware } from './middlewares/ApiKeyUsageMiddleware';
import { OperatorService } from './services/OperatorService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnchorRequestEntity } from './entities/AnchorRequestEntity';
import { AnchorRequestService } from './services/AnchorRequestService';

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
