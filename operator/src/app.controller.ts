import {Controller, Get} from '@nestjs/common';
import PackageConfigService from './package.service';
import { Public } from './workspace-api/decorators/public.decorator';

@Controller()
export class AppController {
    constructor() {
    }


}
