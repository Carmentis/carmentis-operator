import {Controller, Get} from '@nestjs/common';
import PackageConfigService from './package.service';

@Controller()
export class AppController {
    constructor(private readonly packageService: PackageConfigService) {
    }

    @Get()
    index(): string {
        return 'Carmentis Operator v' + this.packageService.operatorVersion
    }
}
