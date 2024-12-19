import { Injectable } from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrganisationDto } from '../dto/create-organisation.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import {ApplicationEntity} from "../entities/application.entity";
import {plainToInstance} from "class-transformer";

@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(ApplicationEntity)
        private readonly applicationRepository: Repository<ApplicationEntity>,
    ) {
    }


    // Insert a new item
    async createApplicationInOrganisationByName(
        organisationEntity: OrganisationEntity,
        applicationName: string
    ): Promise<ApplicationEntity> {
        const application = plainToInstance(ApplicationEntity, {
            organisation: organisationEntity,
            name: applicationName,
        })

        const item = this.applicationRepository.create(
            application
        );
        return this.applicationRepository.save(item);
    }

}