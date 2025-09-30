import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { randomBytes } from 'crypto';
import { ApiKeyUsageEntity } from '../entities/ApiKeyUsageEntity';
import { Request, Response } from 'express';
import { OrganisationEntity } from '../entities/OrganisationEntity';

@Injectable()
export class ApiKeyService extends TypeOrmCrudService<ApiKeyEntity> {
	private logger = new Logger(ApiKeyService.name);
	constructor(
		@InjectRepository(ApiKeyEntity) repo: Repository<ApiKeyEntity>,
		@InjectRepository(ApiKeyUsageEntity) private usageRepo: Repository<ApiKeyUsageEntity>,
		@InjectRepository(ApplicationEntity) private applicationRepository: Repository<ApplicationEntity>
	) {
		super(repo);
	}

	async findAllKeysByApplication(application: ApplicationEntity): Promise<any> {
		return this.repo.find({
			where: { application: { id:  application.id  } },
		})
	}

	async createKey( application: ApplicationEntity, body: Partial<ApiKeyEntity> ) {
		const { uid, key: secret, formattedKey } = this.generateRandomKey();
		const key = this.repo.create(body);
		key.application = application;
		key.key = secret;
		key.uid = uid;
		key.isActive = true;
		const keyEntity = await this.repo.save(key);
		return { keyEntity, formattedKey };
	}

	private generateRandomKey() {
		const uid = randomBytes(32).toString('hex');
		const key = randomBytes(32).toString('hex');
		const formattedKey = `cmts-${uid}-${key}`
		return {uid, key, formattedKey}
	}


	async findOneByKey(key: string) {
		const {uid} = this.parseKey(key);
		return this.repo.findOne({
			where: { uid },
		})
	}

	async findOneById(id: number) {
		return this.repo.findOne({
			relations: ["application"],
			where: { id },
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

	async findApplicationByApiKey(apiKey: ApiKeyEntity) {
		return this.applicationRepository.findOneOrFail({
			relations: ["apiKeys"],
			where: { apiKeys: { id: apiKey.id } },
		})
		/*
		return this.repo.findOneOrFail({
			relations: ["application"],
			where: { uid: apiKey.uid },
			select: ["application"]
		})

		 */
	}

	async logApiKeyUsage( apiKey: ApiKeyEntity,  request: Request, response: Response) {
		if (
			request && response && (
				request.ip &&
				request.url &&
				request.method &&
				response.statusCode
			)
		) {
			const apiKeyUsage = new ApiKeyUsageEntity();
			apiKeyUsage.apiKey = apiKey;
			apiKeyUsage.ip = request.ip;
			apiKeyUsage.requestUrl = request.url;
			apiKeyUsage.requestMethod = request.method;
			apiKeyUsage.responseStatus = response.statusCode;
			return this.usageRepo.save(apiKeyUsage);
		}

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
				apiKey: { id: keyId, },
				responseStatus: typeof filterByUnauthorized == 'boolean' && filterByUnauthorized ? HttpStatus.FORBIDDEN : undefined
			},
			order: { 'usedAt': 'DESC' },
			skip: offset,
			take: limit,
		})
	}

	async updateKey(id: number, updateKey: Partial<ApiKeyEntity>) {
		const key = await this.findOne({where: { id: id }});
		const updatedKey = {...key, ...updateKey};
		return this.repo.save(updatedKey)
	}


	async exists(apiKey: string) {
		// search the key
		const {uid, key} = this.parseKey(apiKey);
		const existingKey = await this.repo.findOne({
			where: { uid },
		});

		// check conditions on the validity of the key
		return !!existingKey && // the key should exist
			existingKey.key === key // the keys should match
	}

	async isActiveKey(apiKey: string) {
		// search the key
		const {uid, key} = this.parseKey(apiKey);
		const existingKey = await this.repo.findOne({
			where: { uid },
		});


		// check conditions on the validity of the key
		return !!existingKey && // the key should exist
			existingKey.isActive && // the key should be active
			existingKey.activeUntil > new Date() && // the key should still be active
			existingKey.key === key // the keys should match
	}

	async deleteKeyById(id: number) {
		return this.repo.delete({
			id
		})
	}


	/**
	 * Parse the key to recover the key and the id.
	 * @param apiKey
	 * @private
	 */
	private parseKey( apiKey: string ) {
		try {
			const [header, uid, key] = apiKey.split('-');
			return {uid,key}
		} catch (e) {
			throw new Error("Provided key has an invalid format")
		}
	}

	async getOrganisationIdByApiKeyId(keyId: number) {
		const org = await OrganisationEntity.findOne({
			where: {
				applications: {
					apiKeys: {
						id: keyId
					}
				}
			},
			select: ['id']
		});
		return org.id;
	}
}