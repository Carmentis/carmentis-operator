import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { API_V1 } from './ApiVersion';
import { configureApiVersioning } from './configureApiVersioning';

@Controller({ path: 'things', version: API_V1 })
class ThingsController {
	@Get()
	list() {
		return { version: 'v1' };
	}
}

@Controller({ path: 'things', version: '2' })
class ThingsV2Controller {
	@Get()
	list() {
		return { version: 'v2' };
	}
}

@Controller('admin')
class AdminController {
	@Get('page')
	page() {
		return { page: true };
	}

	@Get()
	index() {
		return { index: true };
	}
}

@Controller()
class HomeController {
	@Get()
	home() {
		return { home: true };
	}
}

describe('configureApiVersioning', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [ThingsController, ThingsV2Controller, AdminController, HomeController],
		}).compile();
		app = moduleRef.createNestApplication();
		configureApiVersioning(app);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('serves v1 under /api/v1 only, without an unversioned /api alias', async () => {
		await request(app.getHttpServer()).get('/api/v1/things').expect(200, { version: 'v1' });
		await request(app.getHttpServer()).get('/api/things').expect(404);
	});

	it('serves another version next to v1, and 404s on unknown versions', async () => {
		await request(app.getHttpServer()).get('/api/v2/things').expect(200, { version: 'v2' });
		await request(app.getHttpServer()).get('/api/v3/things').expect(404);
	});

	it('leaves the home page and the admin UI unprefixed and unversioned', async () => {
		await request(app.getHttpServer()).get('/').expect(200, { home: true });
		await request(app.getHttpServer()).get('/admin').expect(200, { index: true });
		await request(app.getHttpServer()).get('/admin/page').expect(200, { page: true });
		await request(app.getHttpServer()).get('/api/admin/page').expect(404);
	});
});
