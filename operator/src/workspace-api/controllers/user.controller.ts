import {Controller, Get, Param, Post} from "@nestjs/common";
import {UserService} from "../services/user.service";

@Controller('/workspace/api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("/:publickey")
    async getUserByPublicKey(@Param("publickey") publickey) {
        return this.userService.findOneByPublicKey(publickey);
    }
}