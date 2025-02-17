import { Injectable, Logger, NotFoundException, NotImplementedException, OnModuleInit } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { promises as fs } from 'fs';
import * as path from 'path';
import { EnvService } from '../../shared/services/env.service';


@Injectable()
export class CryptoService implements OnModuleInit{
	private logger = new Logger(CryptoService.name);

	constructor(
		private readonly envService: EnvService
	) {
	}


	async onModuleInit() {
		this.logger.log("Setting up the operator private key");

		const keyPairFilePath = this.envService.operatorKeyPairFile;
		const defaultKeyPairFilePath = path.join(process.cwd(), './operator-keypair.json');
		let operatorPrivateKey = sdk.crypto.generateKey256();
		let operatorPublicKey = sdk.crypto.secp256k1.publicKeyFromPrivateKey(operatorPrivateKey);
		try {
			// Check if the key pair file exists
			const keyPairFile = await fs.readFile(keyPairFilePath || defaultKeyPairFilePath, 'utf8');
			const { privateKey, publicKey } = JSON.parse(keyPairFile);

			if (privateKey && publicKey) {
				this.logger.log('Loaded existing key pair from file');
				operatorPrivateKey = privateKey;
				operatorPublicKey = publicKey;
			} else {
				throw new Error('Invalid key pair file, generating a new pair...');
			}
		} catch (err) {
			// If file is not found or invalid, generate a new key pair
			this.logger.warn('Key pair file not found or invalid, generating a new pair...');

			const keyPair = JSON.stringify(
				{
					privateKey: operatorPrivateKey,
					publicKey: operatorPublicKey,
				},
				null,
				2,
			);

			if (keyPairFilePath) {
				await fs.writeFile(keyPairFilePath, keyPair);
				this.logger.log(`New key pair generated and saved to file ${keyPairFilePath}`);
			} else {
				await fs.writeFile(defaultKeyPairFilePath, keyPair);
				this.logger.log(`New key pair generated and saved to (default) file ${defaultKeyPairFilePath}`);
			}
		}

		// set the operator private key and update the
		const nodeUrl = process.env.NODE_URL;
		this.logger.log(`Linking operator api with node located at ${nodeUrl}`)
		//TODO sdk.operatorCore.initialize(nodeUrl, operatorPrivateKey)
	}
}