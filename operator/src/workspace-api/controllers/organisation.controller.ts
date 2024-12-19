import {Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put} from "@nestjs/common";
import {OrganisationService} from "../services/organisation.service";
import {UserService} from "../services/user.service";
import {OrganisationEntity} from "../entities/organisation.entity";
import {UserEntity} from "../entities/user.entity";
import {ApplicationService} from "../services/application.service";
import {ApplicationEntity} from "../entities/application.entity";
import {CreateOrganisationDto} from "../dto/create-organisation.dto";

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