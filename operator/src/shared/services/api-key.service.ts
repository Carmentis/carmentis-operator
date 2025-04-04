import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { randomBytes } from 'crypto';
import { ApiKeyUsageEntity } from '../entities/api-key-usage.entity';
import { Request, Response, NextFunction } from 'express';
import { ApiKeyUpdateDto } from '../../workspace-api/dto/api-key-update.dto';

@Injectable()
export class ApiKeyService extends TypeOrmCrudService<ApiKeyEntity> {
	constructor(
		@InjectRepository(ApiKeyEntity) repo: Repository<ApiKeyEntity>,
		@InjectRepository(ApiKeyUsageEntity) private usageRepo: Repository<ApiKeyUsageEntity>
	) {
		super(repo);
	}

	async findAllKeysByApplication(application: ApplicationEntity): Promise<any> {
		return this.repo.find({
			where: { application: { id:  application.id  } },
		})
	}

	async createKey( application: ApplicationEntity, body: Partial<ApiKeyEntity> ) {
		const key = this.repo.create(body)
		key.application = application;
		key.key = this.generateRandomKey();
		key.isActive = true;
		return this.repo.save(key);
	}

	private generateRandomKey() {
		const buffer = randomBytes(64);
		const formattedKey = buffer.toString('hex');
		return `cmts_${formattedKey}`
	}

	async deleteKey(apiKey: string) {
		return this.repo.delete(apiKey)
	}

	async exists(key: string) {
		return this.repo.exists({
			where: { key },
		})
	}

	async findOneByKey(key: string) {
		return this.repo.findOne({
			where: { key },
		})
	}

	async findAllKeysByOrganisation(organisationId: number) {
		return this.repo.find({
			relations: ["application"],
			where: {
				application: { organisation: { id: organisationId } }
			}
		})
	}

	async logApiKeyUsage( apiKey: ApiKeyEntity,  request: Request, response: Response) {
		const apiKeyUsage = new ApiKeyUsageEntity();
        apiKeyUsage.apiKey = apiKey;
		apiKeyUsage.ip = request.ip;
        apiKeyUsage.requestUrl = request.url;
        apiKeyUsage.requestMethod = request.method;
        apiKeyUsage.responseStatus = response.statusCode;
        return this.usageRepo.save(apiKeyUsage);
	}


	async countsKeyUsagesByKeyId(keyId: number,unauthorizedOnly: boolean) {
		return this.usageRepo.count({
			where: {
				apiKey: {
					id: keyId
				},
				responseStatus: unauthorizedOnly ? HttpStatus.FORBIDDEN : undefined
			},
		})
	}

	async findKeyUsagesByKeyId(keyId: number, offset: number, limit: number, filterByUnauthorized: boolean) {
		return this.usageRepo.find({
			where: {
				apiKey: {
					id: keyId,
				},
				responseStatus: typeof filterByUnauthorized == 'boolean' && filterByUnauthorized ? HttpStatus.FORBIDDEN : undefined
			},
			order: { 'usedAt': 'DESC' },
			skip: offset,
			take: limit,
		})
	}

	async updateKey(apiKey: number, updateKey: Partial<ApiKeyEntity>) {
		const key = await this.findOne({where: { id: apiKey }});
		const updatedKey = {...key, ...updateKey};
		return this.repo.save(updatedKey)
	}

	async isActiveKey(key: string) {

		const existingKey = await this.repo.findOne({
			where: { key },
			select: ['isActive', 'activeUntil'],
		});

		return !!existingKey && existingKey.isActive && existingKey.activeUntil > new Date();
	}
}