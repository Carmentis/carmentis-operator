import { describe, expect, it, vi } from 'vitest';
import { WalletApplicationController } from './WalletApplicationController';

const WALLET = { id: '11111111-1111-4111-8111-111111111111' } as any;
const ORGANIZATION_ID = '22222222-2222-4222-8222-222222222222';

const application = {
	id: '33333333-3333-4333-8333-333333333333',
	vbId: null,
	name: 'app',
	description: 'd',
	homepageUrl: 'https://app.example',
	logoUrl: '',
	organization: { id: ORGANIZATION_ID },
	wallet: WALLET,
	apiKeys: [],
};
const expected = {
	id: application.id,
	vbId: null,
	name: 'app',
	description: 'd',
	homepageUrl: 'https://app.example',
	logoUrl: '',
	organizationId: ORGANIZATION_ID,
};

describe('WalletApplicationController', () => {
	const create = () => {
		const applicationService = {
			listApplicationsOfWallet: vi.fn().mockResolvedValue([application]),
		};
		return { controller: new WalletApplicationController(applicationService as any), applicationService };
	};

	it('lists the applications of a wallet without leaking relations', async () => {
		const { controller, applicationService } = create();

		await expect(controller.listApplications(WALLET)).resolves.toEqual([expected]);
		expect(applicationService.listApplicationsOfWallet).toHaveBeenCalledWith(WALLET.id);
	});
});
