import {
	Injectable,
	Logger,
} from '@nestjs/common';
import { ApplicationEntity } from '../entities/ApplicationEntity';


@Injectable()
export class ApplicationService {

    private logger = new Logger(ApplicationService.name);
    constructor(
    ) {
    }


	async findApplicationByVbId(applicationVbId: string) {
		return ApplicationEntity.findOneBy({vbId: applicationVbId});
	}

}