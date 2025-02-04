import { Body, Controller, Get, Logger, NotFoundException, Param, Post, Req } from '@nestjs/common';
import {UserService} from "../services/user.service";
import CreateUserDto from '../dto/create-user.dto';
import { OrganisationService } from '../services/organisation.service';

@Controller('/workspace/api/user')
export class UserController {
    private logger = new Logger(UserController.name);
    constructor(
        private readonly userService: UserService,
        private readonly organisationService: OrganisationService
    ) {}

    @Get("/current")
    async getCurrentAuthUser(@Req() request: Request) {
        const publicKey = request['publicKey'];
        const result = await this.userService.findOneByPublicKey(publicKey);
        if (!result) {
            throw new NotFoundException("Authenticated user not found.");
        }
        return result;
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




}
