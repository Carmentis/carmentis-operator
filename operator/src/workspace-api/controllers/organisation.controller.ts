import {Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put} from "@nestjs/common";
import {OrganisationService} from "../services/organisation.service";
import {UserService} from "../services/user.service";
import {OrganisationEntity} from "../entities/organisation.entity";
import {UserEntity} from "../entities/user.entity";
import {ApplicationService} from "../services/application.service";
import {ApplicationEntity} from "../entities/application.entity";
import {ApplicationDto} from "../dto/application.dto";
import {instanceToPlain, plainToInstance} from "class-transformer";

@Controller('/workspace/api/organisation')
export class OrganisationController {
    constructor(
        private readonly organisationService: OrganisationService,
        private readonly userService: UserService,
        private readonly applicationService: ApplicationService,
    ) {}


    @Post()
    async addOrganisation(@Body('name') organisationName: string): Promise<OrganisationEntity> {
        const response = await this.organisationService.createByName(organisationName);
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
        const application: ApplicationEntity = plainToInstance(ApplicationEntity, applicationDto);
        console.log(application)
        await this.applicationService.update(application);
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
        return this.applicationService.createApplicationInOrganisationByName(
            organisation,
            name
        );
    }


    @Get(':organisationId/user/:userPublicKey')
    async getUserInOrganisation(
        @Param('organisationId') organisationId: number,
        @Param('userPublicKey') userPublicKey: string,
    ): Promise<UserEntity> {
        return await this.userService.findUserInOrganisation(userPublicKey, organisationId);
    }

    @Delete(':organisationId/user')
    async removeUser(
        @Param('organisationId') organisationId: number,
        @Body('userPublicKey') userPublicKey: string,
    ) {
    }

    @Put(":organisationId/owner")
    async setOrganisationOwner(
        @Param("organisationId") organisationId: number,
        @Body("publicKey") publicKey: string,
    ) {
        // find the organisation
        const organisation = await this.organisationService.findOne(organisationId);
        if ( !organisation ) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

        // find the user
        const user = await this.userService.findOneByPublicKey(publicKey);
        if ( !user ) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

        // associate
        organisation.owner = user;

        // save
        return await this.organisationService.update(organisation);

    }
}