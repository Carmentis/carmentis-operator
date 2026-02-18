import {
	Injectable,
	Logger,
} from '@nestjs/common';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class ApplicationService extends TypeOrmCrudService<ApplicationEntity> {

    private logger = new Logger(ApplicationService.name);
    constructor(
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
    ) {
		super(applicationRepository);
    }


	async findApplicationByVbId(applicationVbId: string) {
		return ApplicationEntity.findOneBy({vbId: applicationVbId});
	}

}