import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EnvService implements OnModuleInit {
	operatorKeyPairFile?: string;

	onModuleInit(): any {
		// load the (optional) issuer key pair file
		this.operatorKeyPairFile = process.env.OPERATOR_KEYPAIR_FILE;
	}

}