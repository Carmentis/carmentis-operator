import {Injectable, Logger} from '@nestjs/common';
import {readFileSync} from 'fs';
import {join} from 'path';

@Injectable()
export default class PackageConfigService {

    private readonly _operatorVersion: string;

    constructor() {

        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(
            readFileSync(packageJsonPath, 'utf8'),
        );

        this._operatorVersion = packageJson.version;
    }

    get operatorVersion(): string {
        return this._operatorVersion;
    }


}