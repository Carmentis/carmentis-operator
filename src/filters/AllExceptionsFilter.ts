import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException, BadRequestException, Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private logger = new Logger(AllExceptionsFilter.name);
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		let status = 500;
		let errorResponse: any = {
			message: 'Internal server error',
		};

		// Logger la stack côté serveur uniquement
		if (exception instanceof HttpException) {
			this.logger.error(exception.message);
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			// Extraire le message proprement
			errorResponse = typeof exceptionResponse === 'object'
				? exceptionResponse
				: { message: exceptionResponse };
		} else if (exception instanceof Error) {
			console.error("Error:", exception.stack);
			errorResponse = {
				message: exception.message || 'Internal server error',
			};
		} else {
			console.error('Exception inconnue :', exception);
		}

		// Retourner uniquement une erreur propre à l'utilisateur (sans stack trace)
		if (response.status) {
			response.status(status).json(errorResponse);
		} else {
			throw new BadRequestException(errorResponse);
		}
	}
}
