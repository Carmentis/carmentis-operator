import { Module } from '@nestjs/common';
import { OperatorConfigService } from './services/operator-config.service';

@Module({
    providers: [OperatorConfigService],
    exports: [OperatorConfigService],
})
export class OperatorConfigModule {

}