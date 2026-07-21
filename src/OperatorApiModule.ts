import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorsMiddleware } from './middlewares/CorsMiddleware';
import { EncryptionService } from './services/EncryptionService';
import { EncryptionServiceProxy } from './shared/transformers/EncryptionServiceProxy';

@Module({
	imports: [


	],
	controllers: [

	],
	providers: [

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
