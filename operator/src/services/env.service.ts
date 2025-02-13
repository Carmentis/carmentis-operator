import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService implements OnModuleInit {
	operatorKeyPairFile?: string;
	nodeUrl : string
	logger = new Logger(EnvService.name);

	constructor(
		private readonly configService: ConfigService
	) {
		this.nodeUrl = this.configService.getOrThrow<string>('NODE_URL');
		this.operatorKeyPairFile = this.configService.get<string>('OPERATOR_KEYPAIR_FILE')
		if (this.operatorKeyPairFile) {
			this.logger.log(`No operator keypair file provided (${this.operatorKeyPairFile}).`)
		} else {
			this.logger.log(`Operator keypair file provided: ${this.operatorKeyPairFile}`)
		}
	}

	onModuleInit(): any {
	}

}