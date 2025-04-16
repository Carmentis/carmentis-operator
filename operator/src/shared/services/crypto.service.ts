import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { promises as fs } from 'fs';
import { EnvService } from './env.service';

@Injectable()
export class CryptoService implements OnModuleInit{
	private logger = new Logger(CryptoService.name);
	private _adminCreationToken : string;

	constructor(
		private readonly envService: EnvService
	) {

	}

	get adminCreationToken(): string {
		return this._adminCreationToken;
	}

	async onModuleInit() {
		Promise.all([
			this.setupOperatorKeyPair(),
			this.setupAdminCreationToken(),
			this.setupNode()
			])
	}




	private async setupOperatorKeyPair() {
		this.logger.log("Setting up the operator key pair");

		const keyPairFilePath = this.envService.operatorKeyPairFile;
		let operatorPrivateKey = sdk.crypto.generateKey256();
		let operatorPublicKey = sdk.crypto.secp256k1.publicKeyFromPrivateKey(operatorPrivateKey);
		try {
			// Check if the key pair file exists
			const keyPairFile = await fs.readFile(keyPairFilePath, 'utf8');
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

			await fs.writeFile(keyPairFilePath, keyPair);
			this.logger.log(`New key pair generated and saved to file ${keyPairFilePath}`);
		}
	}


	private async setupNode() {
		// set the operator private key and update the
		const nodeUrl = process.env.NODE_URL;
		this.logger.log(`Linking operator api with node located at ${nodeUrl}`)
	}

	private async setupAdminCreationToken() {
		this.logger.log("Setting up administrator creation token");

		let filePath = this.envService.adminTokenFile;
		let token = sdk.utils.encoding.toHexa(sdk.crypto.getRandomBytes(32));


		try {
			// Check if the key pair file exists
			token = await fs.readFile(filePath, 'utf8');
		} catch (err) {
			// If file is not found or invalid, generate a new key pair
			this.logger.warn('Administrator creation token file not found or invalid, generating a new token...');
			await fs.writeFile(this.envService.adminTokenFile, token);
			this.logger.log(`Generated token is saved to file ${this.envService.adminTokenFile}`);
		}

		this._adminCreationToken = token;
		this.logger.log([
			'Below is shown the administrator creation token:',
			'-------------------------------------------------------------',
			`Administrator creation token location: ${filePath}`,
			`Administrator creation token: ${token}`,
			'--------------------------------------------------------------'
		].join('\n'));
	}

	randomKeyPair() {
		const sk = sdk.crypto.secp256k1.randomPrivateKey()
		const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk);
		return { sk, pk }
	}

	async isValidPrivateKey(privateKey: string) {
		return true;
	}

	async publicKeyFromPrivateKey(privateKey: string) {
		return sdk.crypto.secp256k1.publicKeyFromPrivateKey(privateKey)
	}
}