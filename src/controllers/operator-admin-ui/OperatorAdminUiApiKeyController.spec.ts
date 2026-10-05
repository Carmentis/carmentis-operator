import { OperatorAdminUiApiKeyController } from './OperatorAdminUiApiKeyController';
import { ApiKeyUpdateDto } from '../../dto/ApiKeyUpdateDto';

describe('OperatorAdminUiApiKeyController.buildUpdate', () => {
	function createController() {
		const applicationRepository = { findOneByOrFail: jest.fn().mockResolvedValue({ vbId: 'aa' }) };
		const walletRepository = { findOneByOrFail: jest.fn().mockResolvedValue({ id: 3 }) };
		const controller = new OperatorAdminUiApiKeyController(
			{} as any,
			applicationRepository as any,
			walletRepository as any,
			{} as any,
		);
		return { controller, applicationRepository, walletRepository };
	}

	it('only forwards allowlisted fields, ignoring any forged apiKey/id/createdAt/isActive in the body', async () => {
		const { controller } = createController();

		// The global ValidationPipe runs with `whitelist: false`, so extra properties are not
		// stripped before they reach the controller: it must be the one that never forwards them.
		const dto = {
			name: 'renamed',
			apiKey: 'cmts:1:forged-secret',
			id: 999,
			createdAt: new Date('2000-01-01'),
			isActive: false,
		} as ApiKeyUpdateDto & Record<string, unknown>;

		expect(await controller.buildUpdate(dto)).toEqual({ name: 'renamed' });
	});

	it('resolves applicationVbId/walletId into entities, and null explicitly unlinks them', async () => {
		const { controller } = createController();

		expect(await controller.buildUpdate({ applicationVbId: 'aa', walletId: 3 })).toEqual({
			application: { vbId: 'aa' },
			wallet: { id: 3 },
		});
		expect(await controller.buildUpdate({ applicationVbId: null, walletId: null })).toEqual({
			application: null,
			wallet: null,
		});
	});
});
