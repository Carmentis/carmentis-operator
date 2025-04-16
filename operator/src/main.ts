import 'reflect-metadata';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';



async function bootstrap() {
	const logger = new Logger();
	const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	const app = await NestFactory.create(AppModule);

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
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger', app, documentFactory);

	logger.log(`Operator back server listening at port ${port}...`)
	await app.listen(port);
}

bootstrap();
