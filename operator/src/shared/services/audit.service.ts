import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, AuditOperation, EntityType } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
	private readonly logger = new Logger('AuditService');

	constructor(
		@InjectRepository(AuditLogEntity)
		private readonly auditRepository: Repository<AuditLogEntity>,
	) {
	}

	async log(
		entityType: EntityType,
		entityId: number,
		operation: AuditOperation,
		data: any = {}
	) {
		this.logger.log(`Logging organisation creation: ${entityId}`);
		const item = this.auditRepository.create({
			entityType: entityType,
			relatedOrganisationId: entityId,
			operation: operation,
			data: data
		});
		this.auditRepository.save(item);
	}

	async getLogsByOrganisation(organisationId: number) {
		return this.auditRepository.find({
			where: { relatedOrganisationId: organisationId },
			order: {
				"timestamp": 'DESC'
			},
			take: 50
		})
	}
}