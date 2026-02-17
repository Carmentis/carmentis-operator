import { OperatorConfigService } from '../config/services/operator-config.service';
import { getDatabaseConfig } from './getDatabaseConfig';

const config = new OperatorConfigService();
const datasourceOptions = getDatabaseConfig(config);
export default datasourceOptions;