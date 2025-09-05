import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import getPort from 'get-port';


async function bootstrap() {
	const logger = new Logger();
	const app = await NestFactory.create(AppModule);


	// we select the port to listen on
	const specifiedPort: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	const usedPort = await getPort({port: specifiedPort});
	if (specifiedPort !== usedPort) {
		logger.warn(`Port ${specifiedPort} not available: Move on port ${usedPort}`);
	}


	// we disable cors
    app.enableCors({
		origin: '*',
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
	});
	//app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalPipes(new ValidationPipe({whitelist: true}));

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

	// no try
	const swaggerCustomOptions = {
		swaggerOptions: {
			tryItOutEnabled: false,
		},
	};

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(
		'swagger',
		app,
		documentFactory,
		swaggerCustomOptions
	);

	logger.log(`Operator back server listening at port ${usedPort}...`)
	await app.listen(usedPort);
}

bootstrap();
