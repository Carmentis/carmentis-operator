import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {UserService} from "../services/user.service";
import CreateUserDto from '../dto/create-user.dto';

@Controller('/workspace/api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("/:publickey")
    async getUserByPublicKey(@Param("publickey") publickey) {
        return this.userService.findOneByPublicKey(publickey);
    }

    @Post()
    async addUser(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }
}
