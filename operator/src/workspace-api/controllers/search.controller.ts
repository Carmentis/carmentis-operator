import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import {UserService} from "../services/user.service";
import { OrganisationService } from '../services/organisation.service';
import { OracleService } from '../services/oracle.service';
import { ApplicationService } from '../services/application.service';

@Controller('/workspace/api/search')
export class SearchController {
    constructor(
        private readonly userServer: UserService,
        private readonly organisationService: OrganisationService,
        private readonly oracleService: OracleService,
        private readonly applicationService: ApplicationService,
    ) {
    }

    @Get("/user")
    async searchUser(
        @Query('query') query: string,
    ) {
        // ignore empty query
        if ( query === '' ) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        // search users by name or by public key
        const foundUsers = await this.userServer.search(query);
        return foundUsers;
    }


}