import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { OrganisationService } from '../../services/organisation.service';
import { UserService } from '../../services/user.service';
import { OrganisationEntity } from '../../entities/organisation.entity';
import { ApplicationService } from '../../services/application.service';
import { AuditService } from '../../services/audit.service';
import { AuditOperation, EntityType } from '../../entities/audit-log.entity';
import { OracleService } from '../../services/oracle.service';
import { AccessRightService } from '../../services/access-right.service';


@Controller('/workspace/api/organisation')
export class OrganisationController {

    private readonly logger = new Logger(OrganisationController.name);

    constructor(
        private readonly organisationService: OrganisationService,
        private readonly userService: UserService,
        private readonly applicationService: ApplicationService,
        private readonly auditService: AuditService,
        private readonly oracleService: OracleService,
        private readonly accessRightService: AccessRightService
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
    async getAllOrganisations(): Promise<{ id: number, name: string, logoUrl: string }[]> {
        return await this.organisationService.findAll();
    }






}