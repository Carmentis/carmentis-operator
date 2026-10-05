import { BadRequestException, Injectable } from '@nestjs/common';
import * as v from 'valibot';
import { EntityManager } from 'typeorm';
import { PrivateKeyObject, PrivateKeyObjectSchema } from '../types/types';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { PrivateKeyUtils } from '../utils/PrivateKeyUtils';

/**
 * This service is responsible for managing private keys.
 */
@Injectable()
export class PrivateKeyService {

	private static readonly SAMPLE_MESSAGE = new TextEncoder().encode('carmentis-operator private key check');

	/**
	 * Parses an untrusted private key object and checks that it can actually be used, by
	 * signing a sample message and verifying the signature with the derived public key.
	 *
	 * @param candidate The untrusted private key object.
	 * @throws BadRequestException If the object is malformed or the key cannot sign.
	 */
	async parseAndValidate(candidate: unknown): Promise<PrivateKeyObject> {
		const parsed = v.safeParse(PrivateKeyObjectSchema, candidate);
		if (!parsed.success) {
			throw new BadRequestException(
				`Invalid private key: ${parsed.issues.map(issue => issue.message).join('; ')}`,
			);
		}

		try {
			const key = await PrivateKeyUtils.getPrivateSignatureKeyFromPrivateKeyObject(parsed.output);
			const signature = await key.sign(PrivateKeyService.SAMPLE_MESSAGE);
			const publicKey = await key.getPublicKey();
			const isValid = await publicKey.verify(PrivateKeyService.SAMPLE_MESSAGE, signature);
			if (!isValid) {
				throw new Error('the signature of a sample message does not verify');
			}
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			throw new BadRequestException(`The private key is unusable: ${reason}`);
		}
		return parsed.output;
	}

	/**
	 * Validates and persists a private key entity.
	 *
	 * @param privateKey The untrusted private key object.
	 * @param manager Optional entity manager, to take part in a transaction.
	 */
	async createPrivateKey(privateKey: unknown, manager?: EntityManager): Promise<PrivateKeyEntity> {
		const validated = await this.parseAndValidate(privateKey);
		const entity = PrivateKeyEntity.create({ privateKey: validated });
		return manager ? manager.save(entity) : entity.save();
	}

	async findById(id: string): Promise<PrivateKeyEntity | null> {
		return PrivateKeyEntity.findOneBy({ id });
	}
}
