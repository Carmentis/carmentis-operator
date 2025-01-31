import 'reflect-metadata';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';


async function bootstrap() {
	const logger = new Logger();
	const port: number = parseInt(process.env.OPERATOR_PORT) ?? 3000;
	const app = await NestFactory.create(AppModule);
    app.enableCors({
		origin: '*',
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
	});
	app.useGlobalPipes(new ValidationPipe({whitelist: true}));
	logger.log(`Operator back server listening at port ${port}...`)
	await app.listen(port);
}

bootstrap();
