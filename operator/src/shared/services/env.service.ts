import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const DEFAULT_PUBLIC_ACCOUNT_CREATION_ENABLED = false;

@Injectable()
export class EnvService implements OnModuleInit {
	operatorKeyPairFile?: string;
	nodeUrl : string
	publicAccountCreationEnabled: boolean
	maxOraclesInOrganisation = 30
	maxApplicationsInOrganisation = 30
	maxOrganisationsInWhichUserIsAdmin = 10

	logger = new Logger(EnvService.name);

	constructor(
		private readonly configService: ConfigService
	) {
		this.nodeUrl = this.configService.getOrThrow<string>('NODE_URL');
		this.operatorKeyPairFile = this.configService.get<string>('OPERATOR_KEYPAIR_FILE')
		this.publicAccountCreationEnabled = this.configService.get<boolean>('ENABLE_PUBLIC_ACCOUNT_CREATION') || DEFAULT_PUBLIC_ACCOUNT_CREATION_ENABLED;

		// search for limits
		const maxOraclesInOrganisation = this.configService.get<number>('MAX_ORACLES_IN_ORGANISATION')
		if (maxOraclesInOrganisation) this.maxApplicationsInOrganisation = maxOraclesInOrganisation;
		const maxApplicationsInOrganisation = this.configService.get<number>('MAX_APPLICATIONS_IN_ORGANISATION')
        if (maxApplicationsInOrganisation) this.maxApplicationsInOrganisation = maxApplicationsInOrganisation;
        const maxOrganisationsInWhichUserIsAdmin = this.configService.get<number>('MAX_ORGANISATIONS_IN_WHICH_USER_IS_ADMIN')
        if (maxOrganisationsInWhichUserIsAdmin) this.maxOrganisationsInWhichUserIsAdmin = maxOrganisationsInWhichUserIsAdmin;


		// log the public account creation enabled
		if (this.publicAccountCreationEnabled) {
			this.logger.warn("Public account creation enabled !")
		} else {
			this.logger.log("Public account creation disabled.")
		}

		// log the operator keypair file
		if (this.operatorKeyPairFile) {
			this.logger.log(`No operator keypair file provided (${this.operatorKeyPairFile}).`)
		} else {
			this.logger.log(`Operator keypair file provided: ${this.operatorKeyPairFile}`)
		}
	}

	onModuleInit(): any {
	}

}