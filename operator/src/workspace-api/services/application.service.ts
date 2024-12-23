import { Injectable } from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {ApplicationEntity} from "../entities/application.entity";
import {plainToInstance} from "class-transformer";
import {ApplicationDto} from "../dto/application.dto";

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

    async findAllApplicationsInOrganisationByOrganisationId(organisationId: number) {
        return this.applicationRepository
            .createQueryBuilder('application')
            .innerJoin('application.organisation', 'organisation')
            .where('organisation.id = :organisationId', { organisationId })
            .getMany();
    }

    async findApplication(applicationId: number) {
        return this.applicationRepository.findOneBy({ id: applicationId });
    }

    async update(application: ApplicationEntity) {
        return this.applicationRepository.save(application)
    }


    dtoToEntity( applicationDto: ApplicationDto ) : ApplicationEntity {
        const entity = plainToInstance(ApplicationEntity, applicationDto);
        return entity;
    }
}