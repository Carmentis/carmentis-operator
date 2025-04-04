import { Body, Controller, ForbiddenException, Get, Logger, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { UserService } from '../../shared/services/user.service';
import CreateUserDto from '../dto/create-user.dto';
import { OrganisationService } from '../../shared/services/organisation.service';
import { Public } from '../decorators/public.decorator';
import CreateNotWhitelistedUserDto from '../dto/create-user-public.dto';
import { EnvService } from '../../shared/services/env.service';

@Controller('/workspace/api/user')
export class UserController {
    private logger = new Logger(UserController.name);
    constructor(
        private readonly userService: UserService,
        private readonly organisationService: OrganisationService,
        private readonly envService: EnvService,
    ) {}

    @Get("/current")
    async getCurrentAuthUser(@Req() request: Request) {
        return await this.userService.findCurrentlyConnectedUser(request);
    }

    @Get('/isAdmin')
    async currentUserIsAdmin(@Req() request: Request) {
        const user = await this.userService.findCurrentlyConnectedUser(request);
        return {isAdmin: user.isAdmin};
    }

    @Get("/organisation")
    async getOrganisationsByUser(@Req() request: Request) {
        // Validate and fetch the user by public key
        const publickey = request['publicKey']
        const user = await this.userService.findOneByPublicKey(publickey);
        if (!user) {
            throw new NotFoundException(`User with public key ${publickey} not found`);
        }

        // Fetch all organisations for this user
        return await this.organisationService.findOrganisationsByUser(user.publicKey);
    }

    @Get("/:publickey")
    async getUserByPublicKey(@Param("publickey") publickey) {
        return this.userService.findOneByPublicKey(publickey);
    }

    @Post()
    async addUser(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }

    @Public()
    @Post("/createNotWhitelistedUser")
    async createAccount(@Body() createUserDto: CreateNotWhitelistedUserDto) {
        if (!this.envService.publicAccountCreationEnabled)
            throw new ForbiddenException("Account creation is not supported");

        return await this.userService.createNotWhitelistedUser(createUserDto);
    }




}
