import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AnchorRequestService } from './AnchorRequestService';
import { IndexerService } from '../indexer/IndexerService';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';

const JOB_NAME = 'anchor-request-status-check';

/**
 * Periodically asks the indexer whether the microblock of each submitted anchor request is on chain:
 * found -> ANCHORED, not found after the configured delay -> FAILED, otherwise left untouched.
 */
@Injectable()
export class AnchorRequestStatusCronService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(AnchorRequestStatusCronService.name);
	private running = false;

	constructor(
		private readonly anchorRequestService: AnchorRequestService,
		private readonly indexerService: IndexerService,
		private readonly config: OperatorConfigService,
		private readonly schedulerRegistry: SchedulerRegistry,
	) {}

	onModuleInit() {
		const { checkCronExpression } = this.config.getAnchoringConfig();
		const job = new CronJob(checkCronExpression, () => this.resolveSubmittedAnchorRequests());
		this.schedulerRegistry.addCronJob(JOB_NAME, job);
		job.start();
		this.logger.log(`Checking submitted anchor requests with schedule "${checkCronExpression}"`);
	}

	onModuleDestroy() {
		if (this.schedulerRegistry.doesExist('cron', JOB_NAME)) {
			this.schedulerRegistry.deleteCronJob(JOB_NAME);
		}
	}

	async resolveSubmittedAnchorRequests() {
		if (this.running) {
			return;
		}
		this.running = true;
		try {
			const submitted = await this.anchorRequestService.findSubmitted();
			for (const anchorRequest of submitted) {
				try {
					await this.resolve(anchorRequest);
				} catch (e) {
					this.logger.warn(
						`Cannot resolve anchor request ${anchorRequest.anchorRequestId}: ${e instanceof Error ? e.message : e}`,
					);
				}
			}
		} catch (e) {
			this.logger.error(`Cannot list submitted anchor requests: ${e instanceof Error ? e.message : e}`);
		} finally {
			this.running = false;
		}
	}

	private async resolve(anchorRequest: AnchorRequestEntity) {
		const hash = anchorRequest.submittedMicroblockHash;
		const wallet = anchorRequest.application?.wallet;
		if (!hash || !wallet) {
			this.logger.warn(`Anchor request ${anchorRequest.anchorRequestId} has no microblock hash or wallet: skipped`);
			return;
		}

		const microblock = await this.indexerService.for(wallet).findMicroblockByHash(hash);
		if (microblock) {
			await this.anchorRequestService.markAsAnchored(anchorRequest);
			this.logger.log(`Anchor request ${anchorRequest.anchorRequestId} is anchored`);
			return;
		}

		const { submittedTimeoutSeconds } = this.config.getAnchoringConfig();
		const submittedAt = Number(anchorRequest.submittedAt);
		if (Date.now() - submittedAt > submittedTimeoutSeconds * 1000) {
			await this.anchorRequestService.markAsFailed(anchorRequest);
			this.logger.warn(`Anchor request ${anchorRequest.anchorRequestId} not found in the indexer after ${submittedTimeoutSeconds}s: failed`);
		}
	}
}
