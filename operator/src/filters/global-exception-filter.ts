import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();



		// Vérifier si c'est une exception HTTP
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const message = exception.getResponse();
			response.status(status).json({ statusCode: status, message });
		} else {
			// Erreur inconnue (ex: erreur interne)
			// Log l'erreur avec le logger NestJS
			this.logger.error(
				`Unhandled Exception: ${exception instanceof Error ? exception.message : exception}`,
				exception instanceof Error ? exception.stack : '',
			);
			response.status(500).json({ statusCode: 500, message: 'Internal server error' });
		}
	}
}