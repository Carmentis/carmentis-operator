import { Body, ClassSerializerInterceptor, Controller, Get, Logger, Post, Req, UseInterceptors } from '@nestjs/common';
import { OrganisationService } from '../../../shared/services/organisation.service';
import { UserService } from '../../../shared/services/user.service';
import { OrganisationEntity } from '../../../shared/entities/organisation.entity';
import { AuditService } from '../../../shared/services/audit.service';
import { AuditOperation, EntityType } from '../../../shared/entities/audit-log.entity';


/**
 * OrganisationController handles API endpoints related to organisations.
 * It provides functionalities to create a new organisation and retrieve
 * organisation details.
 */
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/workspace/api/organisation')
export class OrganisationController {

    private readonly logger = new Logger(OrganisationController.name);

    constructor(
        private readonly organisationService: OrganisationService,
        private readonly userService: UserService,
        private readonly auditService: AuditService,
    ) {}



    /**
     * Adds a new organisation with the provided name and associates it with the currently connected user.
     *
     * @param {string} organisationName - The name of the organisation to be created.
     * @param {Request} request - The HTTP request object used to determine the currently connected user.
     * @return {Promise<OrganisationEntity>} - A promise that resolves to the created organisation entity.
     */
    @Post()
    async addOrganisation(
        @Body('name') organisationName: string,
        @Req() request: Request
    ): Promise<OrganisationEntity> {
        const user = await this.userService.findCurrentlyConnectedUser(request);
        const response = await this.organisationService.createByName(user, organisationName);
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
     * Retrieves a list of all organisations.
     *
     * @return {Promise<Array<{ id: number, name: string, logoUrl: string }>>} A promise that resolves to*/
    @Get()
    async getAllOrganisations(): Promise<{ id: number, name: string, logoUrl: string, publicSignatureKey: string }[]> {
        return await this.organisationService.findAll();
    }



}