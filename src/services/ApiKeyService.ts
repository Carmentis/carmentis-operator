import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { WalletEntity } from '../entities/WalletEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class ApiKeyService extends TypeOrmCrudService<ApiKeyEntity> {
	private logger = new Logger(ApiKeyService.name);
	constructor(
		@InjectRepository(ApiKeyEntity)
		public readonly repo: Repository<ApiKeyEntity>,
	) {
		super(repo);
	}

	async createKey( name: string, application: ApplicationEntity, activeUntil: Date | undefined ) {
		// we start by creating the key
		const secret = randomBytes(32).toString('hex');
		const key = this.repo.create({
			activeUntil,
			application,
			name,
			apiKey: secret,
			isActive: true,
		});
		const keyEntity = await this.repo.save(key);

		// once the id is defined, we construct the api key
		const formattedKey = this.formatKey(keyEntity.id, application.vbId, secret);
		await this.repo.update({ id: keyEntity.id }, { apiKey: formattedKey })
		return ApiKeyEntity.findOneBy({ id: keyEntity.id })
	}

	async findApplicationByApiKey(apiKey: ApiKeyEntity) {
		return ApplicationEntity.findOne({
			where: {
				apiKeys: {
					id: apiKey.id
				},
			},
			relations: ['wallet']
		})
	}

	async findWalletByApiKey(apiKey: ApiKeyEntity): Promise<WalletEntity> {
		return WalletEntity.findOneBy({
			applications: {
				apiKeys: {
					id: apiKey.id
				}
			}
		})
	}

	/**
	 * Format an API key with the structure: cmts:<id>:<applicationId>:<key>
	 * @param id - The API key entity ID
	 * @param applicationId - The application ID
	 * @param key - The secret key
	 * @private
	 */
	private formatKey(id: number, applicationVbId: string, key: string): string {
		return `cmts:${id}:${applicationVbId}:${key}`;
	}


	async findOneByKey(key: string) {
		const {id} = this.parseKey(key);
		return this.repo.findOne({
			where: { id },
		})
	}

	async updateKey(id: number, updateKey: Partial<ApiKeyEntity>) {
		const key = await this.repo.findOne({where: { id: id }});
		const updatedKey = {...key, ...updateKey};
		return this.repo.save(updatedKey)
	}

	async exists(apiKey: string) {
		// search the key
		const {id} = this.parseKey(apiKey);
		const existingKey = await this.repo.findOne({
			where: { id },
		});

		// check conditions on the validity of the key
		return !!existingKey && // the key should exist
			existingKey.apiKey === apiKey // the keys should match
	}

	async isActiveKey(apiKey: string) {
		// search the key
		const {id} = this.parseKey(apiKey);
		const existingKey = await this.repo.findOne({
			where: { id },
		});


		// check conditions on the validity of the key
		const isCorrectAndValidKey = !!existingKey && // the key should exist
			existingKey.isActive && // the key should be active
			existingKey.apiKey == apiKey // the keys should match;

		if (!isCorrectAndValidKey) return false;

		// the key should still be active
		return existingKey.activeUntil === undefined || existingKey.activeUntil > new Date()
	}

	async deleteKeyById(id: number) {
		return this.repo.delete({
			id
		})
	}


	/**
	 * Parse the key to recover the id, applicationId, and key.
	 * Expected format: cmts:<id>:<applicationId>:<key>
	 * @param apiKey
	 * @private
	 */
	private parseKey( apiKey: string ) {
		try {
			const [header, id, applicationId, key] = apiKey.split(':');
			if (header !== 'cmts' || !id || !applicationId || !key) {
				throw new Error("Invalid format");
			}
			return {
				id: parseInt(id, 10),
				applicationVbId: applicationId,
				key
			}
		} catch (e) {
			throw new Error("Provided key has an invalid format. Expected format: cmts:<id>:<applicationVbId>:<key>")
		}
	}

	async toggleActivityForApiKeyById(id: number) {
		const currentKey = await ApiKeyEntity.findOneBy({ id })
		const currentState = 	currentKey.isActive;
		const newState = !currentState;
		return await ApiKeyEntity.update({ id }, { isActive: newState })
	}
}