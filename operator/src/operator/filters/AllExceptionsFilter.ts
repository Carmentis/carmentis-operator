import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException, BadRequestException,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		// Si l'exception est une HttpException, on peut récupérer la stack
		if (exception instanceof HttpException) {
			console.error("HttpException", exception.stack);
		} else if (exception instanceof Error) {
			// Pour les autres erreurs standards
			console.error("Error:", exception.stack);
		} else {
			// Si ce n'est pas une Error (cas très rare)
			console.error('Exception inconnue :', exception);
		}

		// Réponse générique (optionnelle)
		if (exception instanceof HttpException) {

		} else {
			const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
			if (response.status) {
				console.error("Unknown error:", exception);
				console.log(response.status)
				response.status(500).json({
					message: errorMessage,
				});
			} else {
				throw new BadRequestException(errorMessage);
			}

		}

	}
}
