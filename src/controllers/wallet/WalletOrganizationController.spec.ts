import { describe, expect, it, vi } from 'vitest';
import { WalletOrganizationController } from './WalletOrganizationController';

const ORGANIZATION_ID = '22222222-2222-4222-8222-222222222222';

describe('WalletOrganizationController', () => {
	it('lists the applications of an organization without leaking relations', async () => {
		const application = {
			id: '33333333-3333-4333-8333-333333333333',
			vbId: null,
			name: 'app',
			description: 'd',
			homepageUrl: '',
			logoUrl: '',
			organization: { id: ORGANIZATION_ID },
			wallet: { id: 'w' },
			apiKeys: [],
		};
		const applicationService = { listApplicationsOfOrganization: vi.fn().mockResolvedValue([application]) };
		const controller = new WalletOrganizationController({} as any, {} as any, applicationService as any);

		await expect(controller.listApplications(ORGANIZATION_ID)).resolves.toEqual([
			{ id: application.id, vbId: null, name: 'app', description: 'd', homepageUrl: '', logoUrl: '', organizationId: ORGANIZATION_ID },
		]);
		expect(applicationService.listApplicationsOfOrganization).toHaveBeenCalledWith(ORGANIZATION_ID);
	});
});
