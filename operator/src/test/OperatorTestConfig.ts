import { OperatorConfigService } from '../config/services/operator-config.service';
import { AbstractOperatorConfig } from '../config/services/abstract-operator-config';
import { ConfigSchema, OperatorConfig } from '../config/types/OperatorConfig';

export class OperatorTestConfig extends AbstractOperatorConfig {
	constructor() {
		super(OperatorTestConfig.testConfig);
	}

	private static testConfig: OperatorConfig = ConfigSchema.parse({
		operator: {
			node_url: "https://aphrodite.testnet.carmentis.io",
			database: {
				sqlite: {
					database: "test.sqlite"
				}
			},
		}
	} as OperatorConfig)
}