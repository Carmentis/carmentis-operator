import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Put, Req } from '@nestjs/common';
import { OrganisationService } from '../../shared/services/organisation.service';
import { UserService } from '../../shared/services/user.service';
import CreateUserDto from '../dto/create-user.dto';
import { CreateOrganisationDto } from '../dto/create-organisation.dto';
import { OrganisationEntity } from '../../shared/entities/organisation.entity';
import { UserEntity } from '../../shared/entities/user.entity';
import { getPublicKeyFromRequest } from '../../utils/request-public-key-access.hook';

@Controller('/workspace/api/admin')
export class AdminController {
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly userServer: UserService,
	) {
	}



	@Get('/organisation')
	async getAllOrganisations(
		@Query('query') query: string
	) {
		return await this.organisationService.findByQuery(query)
	}

	@Get('/organisation/:organisationId')
	async getOrganisationById(
		@Param('organisationId') organisationId: number,
	): Promise<OrganisationEntity> {
		const data = await this.organisationService.findOne(organisationId);
		return data
	}

	@Get('/organisation/:organisationId/user')
	async getOrganisationUsersById(
		@Param('organisationId') organisationId: number,
	): Promise<UserEntity[]> {
		return  this.organisationService.findAllUsersInOrganisation(organisationId);
	}



	@Get('/organisation/:organisationId/admin')
	async getOrganisationAdminsById(
		@Param('organisationId') organisationId: number,
	): Promise<OrganisationEntity> {
		throw new HttpException("Not implemented", HttpStatus.NOT_IMPLEMENTED)
	}

	@Post('/organisation')
	async addOrganisation(
		@Req() request: Request,
		@Body() createOrganisationDto: CreateOrganisationDto
	): Promise<OrganisationEntity> {
		const user = await this.userServer.findCurrentlyConnectedUser(request);
		const organisationName = createOrganisationDto.name;
		return await this.organisationService.createByName(user, organisationName);

	}

	@Delete('/organisation')
	async deleteOrganisation(@Body('id') organisationId: number) {
		return await this.organisationService.remove(organisationId);
	}

	@Get('/admin')
	async getAllAdministartors() {
		return await this.userServer.findAllAdministrators();
	}

	@Post('/admin')
	async addAdministrator(@Body() createUserDto: CreateUserDto) {
		return await this.userServer.createAdministrator(createUserDto);
	}

	@Delete('/admin')
	async deleteAdministrator(@Body('publicKey') deletedAdminPublicKey: string) {
		await this.userServer.deleteUser(deletedAdminPublicKey);
	}

	@Get('/user')
	async getAllUsers() {
		return await this.userServer.findAllUsers();
	}

	@Post('/user')
	async addUser(@Body() createUserDto: CreateUserDto) {
		return await this.userServer.createUser(createUserDto);
	}

	@Delete('/user')
	async deleteUser(@Body('publicKey') deletedUserPublicKey: string) {
		await this.userServer.deleteUser(deletedUserPublicKey);
	}




}