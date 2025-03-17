import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException, Logger,
    NotImplementedException,
    UnauthorizedException,
} from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {ApplicationEntity} from "../entities/application.entity";
import {plainToInstance} from "class-transformer";
import { ImportApplicationDto } from '../../workspace-api/dto/import-application.dto';
import ChainService from './chain.service';
import { OrganisationService } from './organisation.service';
import { EnvService } from './env.service';



@Injectable()
export class ApplicationService {
    private logger = new Logger(ApplicationService.name);
    constructor(
        @InjectRepository(ApplicationEntity)
        private readonly applicationRepository: Repository<ApplicationEntity>,
        private readonly organisationService: OrganisationService,
        private readonly chainService: ChainService,
        private readonly envService: EnvService
    ) {
    }


    async findApplicationByTag(tag: string): Promise<ApplicationEntity> {
        const application = await this.applicationRepository.findOneBy({ tag });

        if (!application) {
            throw new HttpException(`Application with tag "${tag}" not found`, HttpStatus.NOT_FOUND);
        }

        return application;
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

        // raise an exception if the number of applications in the organisation is reached.
        const applicationCount = await this.organisationService.getNumberOfApplicationsInOrganisation(organisationEntity.id);
        if (applicationCount >= this.envService.maxApplicationsInOrganisation) {
            throw new UnauthorizedException(
                `Organisation has reached the limit of applications.`
            );
        }

        const tag = Array.from({ length: 30 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const application: ApplicationEntity = plainToInstance(ApplicationEntity, {
            name: applicationName,
            tag
        })
        application.organisation = organisationEntity;
        application.data = {
            fields: [],
            structures: [],
            enumerations: [],
            masks: [],
            messages: [],
        };

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
            .createQueryBuilder('a')
            .innerJoin('a.organisation', 'organisation')
            .where('organisation.id = :organisationId', { organisationId })
            .select(['a.id', 'a.name', 'a.version', 'a.published', 'a.publishedAt', 'a.isDraft', 'a.version', 'a.tag'])
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
        const organisation = await this.organisationService.findOne(organisationId)
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
        throw new NotImplementedException();
	}

    async publishApplication(applicationId: number) {
        try {
            const application = await this.applicationRepository.findOneBy({
                id: applicationId,
            });
            const organisation = await this.getOrganisationByApplicationId(applicationId);
            const mb : MicroBlock = await this.chainService.publishApplication(organisation, application);

            application.isDraft = false;
            application.published = true;
            application.publishedAt = new Date();
            application.version += 1;
            if ( mb.header.height === 1 ) {
                application.virtualBlockchainId = mb.hash;
            }

            return await this.applicationRepository.save(application);
        } catch (e) {
            this.logger.error(e)
            if (e.code === 'ECONNREFUSED') {
                throw new InternalServerErrorException("Cannot connect to the node.");
            } else {
                throw new BadRequestException(e);
            }
        }
    }

    private async getOrganisationByApplicationId(applicationId: number) {
        return this.organisationService.getOrganisationByApplicationId(applicationId)
    }


}