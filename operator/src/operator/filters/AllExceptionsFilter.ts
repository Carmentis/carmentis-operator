import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		// Si l'exception est une HttpException, on peut récupérer la stack
		if (exception instanceof HttpException) {
			console.error(exception.stack);
		} else if (exception instanceof Error) {
			// Pour les autres erreurs standards
			console.error(exception.stack);
		} else {
			// Si ce n'est pas une Error (cas très rare)
			console.error('Exception inconnue :', exception);
		}

		// Réponse générique (optionnelle)
		response.status(500).json({
			message: `Internal Server Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
		});
	}
}
