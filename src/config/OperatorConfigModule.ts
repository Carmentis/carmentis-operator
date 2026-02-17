import { Module } from '@nestjs/common';
import { OperatorConfigService } from './services/operator-config.service';
import { EnvService } from '../services/EnvService';

@Module({
    providers: [OperatorConfigService, EnvService],
    exports: [OperatorConfigService, EnvService],
})
export class OperatorConfigModule {

}