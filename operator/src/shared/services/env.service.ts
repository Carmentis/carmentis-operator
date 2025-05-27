import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as process from 'node:process';

@Injectable()
export class EnvService implements OnModuleInit {
	private _adminTokenFile: string;
	private _operatorKeyPairFile: string;
	private _nodeUrl : string
	private logger = new Logger(EnvService.name);
	private _dbEncryptionKey;

	constructor(
		private readonly configService: ConfigService
	) {
		this._nodeUrl = this.configService.getOrThrow<string>('NODE_URL');

		// check database encryption key
		this._dbEncryptionKey = Buffer.from(
			this.configService.getOrThrow<string>('OPERATOR_DB_ENCRYPTION_KEY'),
			'hex'
		);

		// log the operator keypair file
		try {
			this._operatorKeyPairFile = this.configService.getOrThrow<string>('OPERATOR_KEYPAIR_FILE')
			this.logger.log(`Operator keypair file provided: ${this._operatorKeyPairFile}`)
		} catch {
			this._operatorKeyPairFile = path.join(process.cwd(), './operator-keypair.json');
			this.logger.log(`No operator keypair file provided (default: ${this._operatorKeyPairFile}).`)
		}

		// log the file containing the administration creation token
		try {
            this._adminTokenFile = this.configService.getOrThrow<string>('OPERATOR_ADMIN_TOKEN_FILE');
            this.logger.log(`Admin token file provided: ${this._adminTokenFile}`);
        } catch {
            this._adminTokenFile = path.join(process.cwd(), './admin-token.txt');
            this.logger.log(`No admin token file provided (default: ${this._adminTokenFile}).`);
        }



	}


	onModuleInit(): any {
	}


	get dbEncryptionKey() {
		return this._dbEncryptionKey;
	}

	get nodeUrl(): string {
		return this._nodeUrl
	}

	get operatorKeyPairFile(): string {
		return this._operatorKeyPairFile
	}

	get adminTokenFile(): string {
		return this._adminTokenFile
	}

}