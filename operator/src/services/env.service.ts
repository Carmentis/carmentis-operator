import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService implements OnModuleInit {
	operatorKeyPairFile?: string;
	nodeUrl : string

	constructor(
		private readonly configService: ConfigService
	) {
		this.nodeUrl = this.configService.getOrThrow<string>('NODE_URL');
	}

	onModuleInit(): any {
		// load the (optional) issuer key pair file
		this.operatorKeyPairFile = process.env.OPERATOR_KEYPAIR_FILE;
	}

}