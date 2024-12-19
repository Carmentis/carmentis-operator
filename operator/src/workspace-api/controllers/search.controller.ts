import {Controller, Get, HttpException, HttpStatus, Query} from "@nestjs/common";
import {UserService} from "../services/user.service";

@Controller('/workspace/api/search')
export class SearchController {
    constructor(
        private readonly userServer: UserService,
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