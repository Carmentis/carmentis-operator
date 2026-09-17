import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import getPort, { portNumbers } from 'get-port';
import { OperatorConfigService } from './config/services/operator-config.service';
import { AllExceptionsFilter } from './filters/AllExceptionsFilter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import hbs = require('hbs');

async function bootstrap() {


	const logger = new Logger();

	// create the application and load the configuration
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
	app.useGlobalPipes(new ValidationPipe({
		whitelist: false,
		transform: true,
		transformOptions: {
			exposeDefaultValues: true,
		}
	}));
	app.useGlobalFilters(new AllExceptionsFilter());

	// Cookie parser middleware for session support
	app.use(cookieParser());

	// HBS view engine setup.
	// Views/public/assets are copied into dist/ at build time by nest-cli.json's
	// `compilerOptions.assets` entries, so they are resolved relative to __dirname
	// (dist/ at runtime) exactly like the static assets below — this works identically
	// in dev (nest start --watch keeps dist/ in sync) and from a compiled dist/ build,
	// regardless of the process's current working directory.
	const viewsDir = join(__dirname, 'views');
	app.setBaseViewsDir(viewsDir);
	app.setViewEngine('hbs');
	hbs.registerPartials(join(viewsDir, 'partials'));
	hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);


	// Serve static assets
	app.useStaticAssets(join(__dirname, 'public'), { prefix: '/admin/static/' });
	app.useStaticAssets(join(__dirname, 'assets'), {
		prefix: '/admin/static/assets/',
	});



	// Set up the swagger
	const swaggerCustomOptions = {
		customSiteTitle: "Carmentis Operator",
		jsonDocumentUrl: 'swagger/json',
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
