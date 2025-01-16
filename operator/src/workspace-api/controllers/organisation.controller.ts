import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus, InternalServerErrorException,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put, Query,
} from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';
import { UserService } from '../services/user.service';
import { OrganisationEntity } from '../entities/organisation.entity';
import { UserEntity } from '../entities/user.entity';
import { ApplicationService } from '../services/application.service';
import { ApplicationEntity } from '../entities/application.entity';
import { ApplicationDto } from '../dto/application.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { UpdateAccessRightDto } from '../dto/update-access-rights.dto';
import { ImportApplicationDto } from '../dto/import-application.dto';
import { AuditService } from '../services/audit.service';
import { AuditOperation, EntityType } from '../entities/audit-log.entity';
import { application } from 'express';
import { OracleEntity } from '../entities/oracle.entity';
import { OracleService } from '../services/oracle.service';
import { UpdateOrganisationDto } from '../dto/organisation-update.dto';
import { UpdateOracleDto } from '../dto/update-oracle.dto';



@Controller('/workspace/api/organisation')
export class OrganisationController {

    private readonly logger = new Logger(OrganisationController.name);

    constructor(
        private readonly organisationService: OrganisationService,
        private readonly userService: UserService,
        private readonly applicationService: ApplicationService,
        private readonly auditService: AuditService,
        private readonly oracleService: OracleService,
    ) {}


    @Post()
    async addOrganisation(@Body('name') organisationName: string): Promise<OrganisationEntity> {
        const response = await this.organisationService.createByName(organisationName);
        if ( response ) {
            this.auditService.log(
                EntityType.ORGANISATION,
                response.id,
                AuditOperation.ORGANISATION_CREATION,
                { name: organisationName }
            )
        }
        return response;
    }


    /**
     * Returns the list of organisation in which the current user is involved
     *
     */
    @Get()
    async getAllOrganisations(): Promise<{ id: number, name: string, logoUrl: string }[]> {
        return await this.organisationService.findAll();
    }

    /**
     * Returns the list of organisation in which the current user is involved
     *
     */
    @Get(":organisationId/application")
    async getAllApplications(
        @Param('organisationId') organisationId: number,
    ): Promise<{ id: number, name: string, logoUrl: string }[]> {
        return await this.applicationService.findAllApplicationsInOrganisationByOrganisationId(organisationId);
    }

    /**
     * Returns the list of organisation in which the current user is involved
     *
     */
    @Get(":organisationId/application/:applicationId")
    async getApplicationInOrganisation(
        @Param('organisationId') organisationId: number,
        @Param('applicationId') applicationId: number,
    ) {
        const application = await this.applicationService.findApplication(applicationId);
        return instanceToPlain(application);
    }


    @Get(':organisationId/user')
    async getOrganisationUsersById(
        @Param('organisationId') organisationId: number,
    ): Promise<UserEntity[]> {
        return  this.organisationService.findAllUsersInOrganisation(organisationId);
    }

    @Post(':organisationId/application/import')
    async importApplication(
        @Param('organisationId') organisationId: number,
        @Body() importApplication: ImportApplicationDto
    ): Promise<ApplicationEntity> {
        // create the application
        const result = await this.applicationService.importApplicationInOrganisation(
            organisationId,
            importApplication
        );

        // log the application creation
        if ( result ) {
            this.auditService.log(
                EntityType.APPLICATION,
                organisationId,
                AuditOperation.APPLICATION_CREATION,
                { name: importApplication.name }
            )
        }

        // return the created application
        return result
    }


    /**
     * Update an organisation
     *
     */
    @Put(':organisationId')
    async updateOrganisation(
        @Param('organisationId') organisationId: number,
        @Body() organisationDto: UpdateOrganisationDto,
    ): Promise<OrganisationEntity> {
        // create an organisation entity from the input DTO
        const organisation: OrganisationEntity = plainToInstance(OrganisationEntity, organisationDto);
        organisation.isDraft = true;
        const success = await this.organisationService.update(organisationId, organisation);

        if (success) {
            this.auditService.log(
                EntityType.ORGANISATION,
                organisationId,
                AuditOperation.ORGANISATION_EDITION,
                { name: organisation.name },
            );
        }

        return organisation;
    }

    /**
     * Update an application
     *
     */
    @Put(":organisationId/application/:applicationId")
    async updateApplicationInOrganisation(
        @Param('organisationId') organisationId: number,
        @Param('applicationId') applicationId: number,
        @Body() applicationDto: ApplicationDto
    ) {
        // create an application entity from the input DTO
        const application: ApplicationEntity = plainToInstance(ApplicationEntity, applicationDto);
        application.isDraft = true;
        const success = await this.applicationService.update(application);
        if ( success ) {
            this.auditService.log(
                EntityType.APPLICATION,
                organisationId,
                AuditOperation.APPLICATION_EDITION,
                { name: application.name }
            )
        }
    }

    /**
     * Update an roacle
     *
     */
    @Put(":organisationId/oracle/:oracleId")
    async updateOracleInOrganisation(
        @Param('organisationId') organisationId: number,
        @Param('oracleId') oracleId: number,
        @Body() oracleDto: UpdateOracleDto
    ) {
        const oracle: OracleEntity = plainToInstance(OracleEntity, oracleDto);
        console.log("oracle to update", oracleDto)
        oracle.isDraft = true;
        const success = await this.oracleService.update(oracleId, oracle);
        if ( success ) {
            this.auditService.log(
                EntityType.ORACLE,
                organisationId,
                AuditOperation.ORGANISATION_EDITION,
                { name: oracle.name }
            )
        }
    }

    @Get(':organisationId')
    async getOrganisationById(
        @Param('organisationId') organisationId: number,
    ): Promise<OrganisationEntity> {
        return await this.organisationService.findOne(organisationId);
    }


    @Post(':organisationId/application')
    async createApplicationInOrganisation(
        @Param('organisationId') organisationId: number,
        @Body('applicationName') name: string,
    ): Promise<ApplicationEntity> {
        const organisation = await this.organisationService.findOne(organisationId);
        if ( !organisation ) {
            throw new HttpException('Organisation not found', HttpStatus.NOT_FOUND);
        }
        const result = this.applicationService.createApplicationInOrganisationByName(
            organisation,
            name
        );

        if ( result ) {
            this.auditService.log(
                EntityType.APPLICATION,
                organisationId,
                AuditOperation.APPLICATION_CREATION,
                { name: name }
            )
        }


        return result;
    }

    @Delete(':organisationId/application/:applicationId')
    async deleteApplicationInOrganisation(
        @Param('organisationId') organisationId: number,
        @Param('applicationId') applicationId: number,
    ): Promise<ApplicationEntity> {
        const deletedApplication = await this.applicationService.deleteApplicationById(applicationId);
        if ( deletedApplication ) {
            this.auditService.log(
                EntityType.APPLICATION,
                organisationId,
                AuditOperation.APPLICATION_DELETION,
                { name: deletedApplication.name }
            )
        }

        return deletedApplication;
    }


    @Get(':organisationId/user/:userPublicKey')
    async getUserInOrganisation(
        @Param('organisationId') organisationId: number,
        @Param('userPublicKey') userPublicKey: string,
    ): Promise<UserEntity> {
        return await this.userService.findUserInOrganisation(userPublicKey, organisationId);
    }

    @Post(':organisationId/user')
    async addExistingUserInOrganisation(
        @Param('organisationId') organisationId: number,
        @Body('userPublicKey') userPublicKey: string,
    ): Promise<OrganisationAccessRightEntity> {
        console.log(`Adding user ${userPublicKey} to ${organisationId}`);
        // obtain the organisation and user (abort if one not found)
        const organisation = await this.organisationService.findOne(organisationId);
        const user = await this.userService.findOneByPublicKey(userPublicKey);
        if ( !organisation || !user ) throw new HttpException('Organisation or user not found', HttpStatus.NOT_FOUND);

        // check that the user do not exist yet in the organisation
        const existingAccessRights = await this.organisationService.findAccessRightsByOrganisationId(organisationId);
        const existingUserPublicKeys = existingAccessRights
            .filter( a => a.user.publicKey === userPublicKey );
        if ( existingUserPublicKeys.length !== 0 ) throw new HttpException('User already exists', HttpStatus.CONFLICT);

        // add the user in organisation
        const accessRight = new OrganisationAccessRightEntity();
        accessRight.organisation = organisation;
        accessRight.user = user;

        // log the user access right creation
        this.auditService.log(
            EntityType.USER,
            organisationId,
            AuditOperation.ORGANISATION_USER_INSERTION,
            { name: `${user.firstname} ${user.lastname}`, publicKey: userPublicKey },
        )

        // save the access right
        return await this.organisationService.createAccessRight(accessRight);
    }

    @Delete(':organisationId/user')
    async removeUser(
        @Param('organisationId') organisationId: number,
        @Body('userPublicKey') userPublicKey: string,
    ) {
        const user = this.organisationService.removeUserFromOrganisation( organisationId, userPublicKey );
        if ( user ) {
            this.auditService.log(
                EntityType.USER,
                organisationId,
                AuditOperation.ORGANISATION_USER_INSERTION,
                { publicKey: userPublicKey },
            )
        }
    }


    @Put(":organisationId/user/:userPublicKey/rights")
    async updateAccessRights(
        @Param('organisationId') organisationId: number,
        @Param('userPublicKey') userPublicKey: string,
        @Body() rights: UpdateAccessRightDto,
    ) {
        this.logger.log(`Updating rights for organisation ${organisationId} and user ${userPublicKey}`, JSON.stringify(rights))
        return this.organisationService.updateAccessRights(organisationId, userPublicKey, rights);
    }

    @Get(':organisationId/stats')
    async getStatistics(@Param('organisationId') organisationId: number) {
        const applicationsNumber =  await this.organisationService.getNumberOfApplicationsInOrganisation(organisationId);
        const usersNumber = await this.organisationService.getNumberOfUsersInOrganisation(organisationId);
        const balance = await this.organisationService.getBalanceOfOrganisation(organisationId);
        const oraclesNumber = await this.oracleService.getNumberOfOraclesInOrganisation(organisationId);
        return {
            oraclesNumber,
            applicationsNumber,
            usersNumber,
            balance
        }
    }


    @Get(':organisationId/logs')
    async getLogsOfOrganisation(@Param('organisationId') organisationId: number) {
        return this.auditService.getLogsByOrganisation(organisationId);
    }










    /**
     * Create a new Oracle entry for a specific organisation
     * @param organisationId ID of the organisation
     * @param body Request body containing Oracle name
     * @returns The created Oracle entity
     */
    @Post(':organisationId/oracle')
    async createOracleFromNameInOrganisation(
        @Param('organisationId') organisationId: number,
        @Body('name') name: string
    ): Promise<OracleEntity> {
        const organisation = await this.organisationService.findOne(organisationId);
        return this.oracleService.createOracleByName(organisation, name);
    }

    /**
     * Retrieve all Oracles associated with a specific organisation
     * @param organisationId ID of the organisation
     * @returns List of Oracle entities
     */
    @Get(':organisationId/oracle')
    async getAllOraclesInOrganisation(@Param('organisationId') organisationId: number): Promise<OracleEntity[]> {
        return this.oracleService.getAllOraclesInOrganisation(organisationId);
    }

    /**
     * Retrieve a specific Oracle by its ID
     * @param organisationId ID of the organisation
     * @param oracleId ID of the Oracle
     * @returns The requested Oracle entity
     */
    @Get(':organisationId/oracle/:oracleId')
    async getOracle(@Param('organisationId') organisationId: number, @Param('oracleId') oracleId: number): Promise<OracleEntity> {
        const oracle = await this.oracleService.getOracleById(oracleId);
        if (!oracle) throw new NotFoundException('Oracle not found');
        return oracle;
    }

    /**
     * Delete a specific Oracle by its ID
     * @param organisationId ID of the organisation
     * @param oracleId ID of the Oracle
     * @returns The deleted Oracle entity
     */
    @Delete(':organisationId/oracle/:oracleId')
    async deleteOracle(@Param('organisationId') organisationId: number, @Param('oracleId') oracleId: number): Promise<OracleEntity> {
        return this.oracleService.deleteOracleById(oracleId);
    }

    /**
     * Update an existing Oracle by its ID
     * @param organisationId ID of the organisation
     * @param oracleId ID of the Oracle
     * @param updateData
     * @returns The updated Oracle entity
     */
    @Put(':organisationId/oracle/:oracleId')
    async updateOracle(
        @Param('organisationId') organisationId: number,
        @Param('oracleId') oracleId: number,
        @Body() updateData: Partial<OracleEntity>
    ): Promise<void> {
        const oracle = await this.oracleService.getOracleById(oracleId);
        if (!oracle) throw new NotFoundException('Oracle not found');
        Object.assign(oracle, updateData);
        await this.oracleService.updateOracle(oracle);
    }


    /**
     * Search for users, oracles and applications by name
     *
     * @param organisationId
     * @param query
     */
    @Get(':organisationId/search')
    async search(
        @Param('organisationId') organisationId: number,
        @Query('query') query: string
    ) {
        // ignore empty query
        if ( query === '' ) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }


        // search users by name
        const foundUsers = await this.userService.search(query);

        // search oracles by name
        const foundOracles = await this.oracleService.search(organisationId, query);

        // search applications by name
        const foundApplications = await this.applicationService.search(organisationId, query);

        return {
            'users': foundUsers,
            'oracles': foundOracles,
            'applications': foundApplications,
        }
    }

    @Get(":organisationId/publicationCost")
    async getOrganisationPublicationCost(
        @Param('organisationId') organisationId: number,
    ) {
        return await this.organisationService.getPublicationCost(organisationId);
    }


    @Post(":organisationId/publish")
    async publishOrganisation(
        @Param('organisationId') organisationId: number,
    ) {
        await this.organisationService.publishOrganisation(organisationId);
    }

    @Get(":organisationId/application/:applicationId/publicationCost")
    async getApplicationPublicationCost(
        @Param('organisationId') organisationId: number,
        @Param('applicationId') applicationId: number,
    ) {
        return await this.applicationService.getPublicationCost(applicationId);
    }


    @Post(":organisationId/application/:applicationId/publish")
    async publishApplication(
        @Param('organisationId') organisationId: number,
        @Param('applicationId') applicationId: number,
    ) {
        try {
            await this.applicationService.publishApplication(applicationId);
        } catch (e) {
            console.error(e)
            throw new InternalServerErrorException();
        }
    }

    @Post(":organisationId/oracle/:oracleId/publish")
    async publishOracle(
        @Param('organisationId') organisationId: number,
        @Param('oracleId') oracleId: number,
    ) {

        try {
            await this.oracleService.publishOracle(oracleId);
        } catch (e) {
            console.error(e)
            throw new InternalServerErrorException();
        }
    }





}