import { OperatorAdminApiApiKeyController } from './OperatorAdminApiApiKeyController';
import { ApiKeyUpdateDto } from '../../dto/ApiKeyUpdateDto';

describe('OperatorAdminApiApiKeyController.updateApiKey', () => {
	it('only forwards allowlisted fields to the service, ignoring any forged apiKey/id/createdAt/isActive in the body', async () => {
		const updateKey = jest.fn().mockResolvedValue({ id: 1 });
		const service = { updateKey } as any;
		const controller = new OperatorAdminApiApiKeyController(service);

		// Simulates a client sending extra, non-allowlisted properties in the request body.
		// The global ValidationPipe runs with `whitelist: false`, so such a payload is not
		// stripped before it reaches the controller — the controller itself must be the one
		// that never reads/forwards these fields.
		const dto = {
			name: 'renamed',
			apiKey: 'cmts:1:forged-secret',
			id: 999,
			createdAt: new Date('2000-01-01'),
			isActive: false,
		} as ApiKeyUpdateDto & Record<string, unknown>;

		await controller.updateApiKey(1, dto);

		expect(updateKey).toHaveBeenCalledTimes(1);
		const [, forwarded] = updateKey.mock.calls[0];
		expect(forwarded).toEqual({ name: 'renamed' });
		expect(forwarded).not.toHaveProperty('apiKey');
		expect(forwarded).not.toHaveProperty('id');
		expect(forwarded).not.toHaveProperty('createdAt');
		expect(forwarded).not.toHaveProperty('isActive');
	});

	it('resolves applicationVbId/walletId into entities, and null explicitly unlinks them', async () => {
		const updateKey = jest.fn().mockResolvedValue({ id: 1 });
		const service = { updateKey } as any;
		const controller = new OperatorAdminApiApiKeyController(service);

		await controller.updateApiKey(1, { applicationVbId: null, walletId: null } as any);

		const [, forwarded] = updateKey.mock.calls[0];
		expect(forwarded).toEqual({ application: null, wallet: null });
	});
});
