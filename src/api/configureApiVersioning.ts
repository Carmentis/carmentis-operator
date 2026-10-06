import { INestApplication, RequestMethod, VersioningType } from '@nestjs/common';
import { API_PREFIX } from './ApiVersion';

/**
 * Serves the public API under `/api/v<N>/...`.
 *
 * The global prefix would apply to every controller, so the routes that are not part of the
 * public API (the landing redirect and the admin UI, mounted under `/admin`) are excluded.
 * Versioning is opt-in per controller (no default version), which keeps those routes
 * unversioned.
 */
export function configureApiVersioning(app: INestApplication) {
	app.setGlobalPrefix(API_PREFIX, {
		exclude: [
			{ path: '/', method: RequestMethod.GET },
			{ path: 'admin', method: RequestMethod.ALL },
			{ path: 'admin/{*path}', method: RequestMethod.ALL },
		],
	});
	app.enableVersioning({ type: VersioningType.URI });
}
