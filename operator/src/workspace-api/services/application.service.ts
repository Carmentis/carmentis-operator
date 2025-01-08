import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {ApplicationEntity} from "../entities/application.entity";
import {plainToInstance} from "class-transformer";
import { ImportApplicationDto } from '../dto/import-application.dto';
import * as sdk from '@cmts-dev/carmentis-sdk';
import ChainService from './chain.service';

@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(ApplicationEntity)
        private readonly applicationRepository: Repository<ApplicationEntity>,

        @InjectRepository(OrganisationEntity)
        private readonly organisationRepository: Repository<OrganisationEntity>,

        private readonly chainService: ChainService,
    ) {
    }


    /**
     * Creates an application from an application name in the specified organisation.
     * @param organisationEntity
     * @param applicationName
     */
    async createApplicationInOrganisationByName(
        organisationEntity: OrganisationEntity,
        applicationName: string
    ): Promise<ApplicationEntity> {
        const application: ApplicationEntity = plainToInstance(ApplicationEntity, {
            name: applicationName,
        })
        application.organisation = organisationEntity;
        application.data = {};

        const item = this.applicationRepository.create(
            application
        );
        return this.applicationRepository.save(item);
    }

    /**
     * Returns all applications in the specified organisation.
     *
     * @param organisationId
     */
    async findAllApplicationsInOrganisationByOrganisationId(organisationId: number) {
        return this.applicationRepository
            .createQueryBuilder('application')
            .innerJoin('application.organisation', 'organisation')
            .where('organisation.id = :organisationId', { organisationId })
            .getMany();
    }

    /**
     * Returns an application by its identifier.
     * @param applicationId
     */
    async findApplication(applicationId: number) {
        return this.applicationRepository.findOneBy({ id: applicationId });
    }

    /**
     * Updates an application.
     * @param application
     */
    async update(application: ApplicationEntity) {
        return this.applicationRepository.save(application)
    }


    /**
     * Import an application.
     *
     * @param organisationId
     * @param importApplication
     */
    async importApplicationInOrganisation(organisationId: number, importApplication: ImportApplicationDto): Promise<ApplicationEntity> {
        const organisation = await this.organisationRepository.findOneBy({ id: organisationId });
        const application = plainToInstance(ApplicationEntity, importApplication);
        application.organisation = organisation;
        const item = this.applicationRepository.create(application);
        return this.applicationRepository.save(item);

    }

    /**
     * Deletes an application based on its identifier.
     * @param applicationId
     */
    async deleteApplicationById(applicationId: number) {
        const deletedApplication = await this.applicationRepository.findOneBy(
            { id: applicationId },
        );
        const deletionResponse = await this.applicationRepository.delete({
            id: applicationId,
        })
        if ( deletionResponse.affected === 1 ) {
            return deletedApplication;
        } else {
            throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
        }
    }

	async search(organisationId: number, query: string) {
        return this.applicationRepository.createQueryBuilder('app')
            .select(['app.id', 'app.name'])
            .innerJoin('app.organisation', 'org')
            .where('app.name LIKE :query', { query: `%${query}%` })
            .andWhere('org.id = :organisationId', { organisationId })
            .limit(10)
            .getMany();
	}

	async getPublicationCost(applicationId: number) {
        const application = await this.applicationRepository.findOneBy({
            id: applicationId,
        });
        return this.chainService.publishApplication(application);
	}

    async publishApplication(applicationId: number) {

    }
}