import { AnchorRequestStatusCronService } from './AnchorRequestStatusCronService';

const TIMEOUT = 600;

function request(id: string, ageSeconds: number, hash: string | undefined = `hash-${id}`) {
	return {
		anchorRequestId: id,
		submittedMicroblockHash: hash,
		submittedAt: Date.now() - ageSeconds * 1000,
		application: { wallet: { id: 1, indexerEndpoint: 'https://indexer.example' } },
	} as any;
}

function setup(submitted: any[], findMicroblockByHash: jest.Mock) {
	const anchorRequestService = {
		findSubmitted: jest.fn().mockResolvedValue(submitted),
		markAsAnchored: jest.fn().mockResolvedValue(undefined),
		markAsFailed: jest.fn().mockResolvedValue(undefined),
	};
	const indexerService = { for: jest.fn().mockReturnValue({ findMicroblockByHash }) };
	const config = {
		getAnchoringConfig: () => ({ checkCronExpression: '* * * * *', submittedTimeoutSeconds: TIMEOUT }),
	};
	const service = new AnchorRequestStatusCronService(
		anchorRequestService as any,
		indexerService as any,
		config as any,
		{} as any,
	);
	return { service, anchorRequestService };
}

describe('AnchorRequestStatusCronService', () => {
	it('marks a request found in the indexer as anchored', async () => {
		const r = request('a', 10);
		const { service, anchorRequestService } = setup([r], jest.fn().mockResolvedValue({ hash: r.submittedMicroblockHash }));
		await service.resolveSubmittedAnchorRequests();
		expect(anchorRequestService.markAsAnchored).toHaveBeenCalledWith(r);
		expect(anchorRequestService.markAsFailed).not.toHaveBeenCalled();
	});

	it('leaves a request not found within the delay untouched', async () => {
		const { service, anchorRequestService } = setup([request('a', 10)], jest.fn().mockResolvedValue(null));
		await service.resolveSubmittedAnchorRequests();
		expect(anchorRequestService.markAsAnchored).not.toHaveBeenCalled();
		expect(anchorRequestService.markAsFailed).not.toHaveBeenCalled();
	});

	it('marks a request not found past the delay as failed', async () => {
		const r = request('a', TIMEOUT + 10);
		const { service, anchorRequestService } = setup([r], jest.fn().mockResolvedValue(null));
		await service.resolveSubmittedAnchorRequests();
		expect(anchorRequestService.markAsFailed).toHaveBeenCalledWith(r);
	});

	it('keeps processing others when the indexer fails for one request', async () => {
		const bad = request('bad', TIMEOUT + 10);
		const good = request('good', 10);
		const find = jest.fn().mockImplementation(async (hash: string) => {
			if (hash === bad.submittedMicroblockHash) throw new Error('indexer down');
			return { hash };
		});
		const { service, anchorRequestService } = setup([bad, good], find);
		await service.resolveSubmittedAnchorRequests();
		expect(anchorRequestService.markAsFailed).not.toHaveBeenCalled();
		expect(anchorRequestService.markAsAnchored).toHaveBeenCalledWith(good);
	});
});
