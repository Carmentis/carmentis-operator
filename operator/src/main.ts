import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import getPort, { portNumbers } from 'get-port';
import { OperatorConfigService } from './config/services/operator-config.service';
import { AllExceptionsFilter } from './operator/filters/AllExceptionsFilter';

import {Logger as CarmentisSdkLogger} from '@cmts-dev/carmentis-sdk/server';

async function bootstrap() {

	CarmentisSdkLogger.enableLogsSync();

	const logger = new Logger();

	// create the application and load the configuration
	const app = await NestFactory.create(AppModule);
	const operatorConfig = app.get(OperatorConfigService);


	// we select the port to listen on. We use getPort to choose the closest available port.
	const specifiedPort = operatorConfig.getPort()
	const usedPort = await getPort({
		port: portNumbers(specifiedPort, specifiedPort + 1000)
	})
	if (specifiedPort !== usedPort) {
		logger.warn(`Port ${specifiedPort} not available: Move on port ${usedPort}`);
	}


	// Set the cors config
	const corsConfig = operatorConfig.getCorsConfig();
	logger.log(`cors: origin: ${corsConfig.origin}, methods: ${corsConfig.methods}`);
    app.enableCors({
		origin: corsConfig.origin,
		methods: corsConfig.methods,
	});

	// Set global verification enabled.
	app.useGlobalPipes(new ValidationPipe({whitelist: true}));
	app.useGlobalFilters(new AllExceptionsFilter());



	// Set up the swagger
	const swaggerCustomOptions = {
		swaggerOptions: {
			tryItOutEnabled: false,
		},
	};

	const config = new DocumentBuilder()
		.setTitle('Carmentis Operator API')
		.setDescription('Documentation for the operator API.')
		.setVersion('1.0')
		.addApiKey(
			{
				type: 'apiKey',
				name: 'Authorization',
				in: 'header',
			},
			'api-key'
		)
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	const swaggerPath = operatorConfig.getSwaggerPath();
	logger.log(`Swagger Path: /${swaggerPath}`);
	SwaggerModule.setup(
		swaggerPath,
		app,
		documentFactory,
		swaggerCustomOptions
	);

	logger.log(`Operator back server listening at port ${usedPort}...`)
	await app.listen(usedPort);
}

bootstrap();
