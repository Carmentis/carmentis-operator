import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Put } from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';
import { UserService } from '../services/user.service';
import CreateUserDto from '../dto/create-user.dto';
import { CreateOrganisationDto } from '../dto/create-organisation.dto';
import { OrganisationEntity } from '../entities/organisation.entity';
import { UserEntity } from '../entities/user.entity';

@Controller('/workspace/api/admin')
export class AdminController {
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly userServer: UserService,
	) {
	}



	@Get('/organisation')
	async getAllOrganisations() {
		return await this.organisationService.findAll();
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
	async addOrganisation(@Body() createOrganisationDto: CreateOrganisationDto): Promise<OrganisationEntity> {
		const organisationName = createOrganisationDto.name;
		return await this.organisationService.createByName(organisationName);

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