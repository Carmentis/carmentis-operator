import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotImplementedException,
} from '@nestjs/common';
import { OrganisationEntity } from '../entities/OrganisationEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { plainToInstance } from 'class-transformer';
import ChainService from './ChainService';
import { OrganisationService } from './OrganisationService';
import { EnvService } from './EnvService';
import { UserEntity } from '../entities/UserEntity';


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
        return this.applicationRepository.find({
            where: { organisation: { id: organisationId } },
        })
    }

    /**
     * Returns an application by its identifier.
     * @param applicationId
     */
    async findApplication(applicationId: number) {
        return this.applicationRepository.findOneBy({ id: applicationId });
    }


    async update(application: ApplicationEntity, update: Partial<ApplicationEntity>) {
        const updatedApplication = this.applicationRepository.merge(application, update);
        return this.applicationRepository.save(updatedApplication)
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
        return this.applicationRepository.find({
            where: [
                { organisation: { id: organisationId } },
                { name: Like(`%${query}%`) }
            ],
            select: ['id', 'name']
        })
        /*
        return this.applicationRepository.createQueryBuilder('app')
            .select(['app.id', 'app.name'])
            .innerJoin('app.organisation', 'org')
            .where('app.name LIKE :query', { query: `%${query}%` })
            .andWhere('org.id = :organisationId', { organisationId })
            .limit(10)
            .getMany();

         */
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
            const microBlockHash = await this.chainService.publishApplication(organisation, application);

            application.isDraft = false;
            application.published = true;
            application.publishedAt = new Date();
            application.version += 1;
            if ( !application.virtualBlockchainId ) {
                application.virtualBlockchainId = microBlockHash.encode();
            }

            this.logger.debug(`Application published: located at ${microBlockHash.encode()}`)
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

    async getOrganisationByApplicationId(applicationId: number) {
        return this.organisationService.getOrganisationByApplicationId(applicationId)
    }

    private generateTag(): string {
        return Array.from({ length: 30 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    }


	async findAllApplications() {
		return this.applicationRepository.find();
	}

	/**
	 * A user is allowed to perform action on an application if the user is an admin or is a member of the organization
	 * owning the application.
	 *
	 * @param user
	 * @param applicationId
	 */
	async isAuthorizedUser(user: UserEntity, applicationId: number) {
		if (user.isAdmin) return true;
		return await this.applicationRepository.exists({
			where: {
				id: applicationId,
				organisation: {
					accessRights: {
						user: {
							publicKey: user.publicKey
						}
					}
				},
			}
		});
	}

	async getOrganisationIdByApplicationId(appId: number) {
		const org = await OrganisationEntity.findOne({
			where: {
				applications: {
					id: appId
				}
			},
			select: ['id']
		});
		return org.id;
	}
}