import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus, InternalServerErrorException,
	Logger, NotFoundException,
	Param,
	Post,
	Put, Query,
	Req, UseGuards,
} from '@nestjs/common';
import { OrganisationService } from '../../../shared/services/organisation.service';
import { UserService } from '../../../shared/services/user.service';
import { ApplicationService } from '../../../shared/services/application.service';
import { AuditService } from '../../../shared/services/audit.service';
import { OracleService } from '../../../shared/services/oracle.service';
import { AccessRightService } from '../../../shared/services/access-right.service';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserEntity } from '../../../shared/entities/user.entity';
import { ImportApplicationDto } from '../../dto/import-application.dto';
import { ApplicationEntity } from '../../../shared/entities/application.entity';
import { AuditOperation, EntityType } from '../../../shared/entities/audit-log.entity';
import { UpdateOrganisationDto } from '../../dto/organisation-update.dto';
import { OrganisationEntity } from '../../../shared/entities/organisation.entity';
import { ApplicationDto } from '../../dto/application.dto';
import { UpdateOracleDto } from '../../dto/update-oracle.dto';
import { OracleEntity } from '../../../shared/entities/oracle.entity';
import { OrganisationAccessRightEntity } from '../../../shared/entities/organisation-access-right.entity';
import { UpdateAccessRightDto } from '../../dto/update-access-rights.dto';
import { UserInOrganisationGuard } from '../../guards/user-in-organisation.guard';
import {
	CanEditApplications,
	CanEditUsers,
	IsAdminInOrganisation,
} from '../../guards/user-has-valid-access-right.guard';
import ChainService from '../../../shared/services/chain.service';
import { Public } from '../../decorators/public.decorator';



@UseGuards(UserInOrganisationGuard)
@Controller('/workspace/api/organisation')
export class OrganisationScopedController {

	private readonly logger = new Logger(OrganisationScopedController.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly userService: UserService,
		private readonly applicationService: ApplicationService,
		private readonly auditService: AuditService,
		private readonly oracleService: OracleService,
		private readonly chainService: ChainService,
	) {}

	/**
	 * Returns the list of organisation in which the current user is involved
	 *
	 */
	@Get(":organisationId/application")
	async getAllApplications(
		@Param('organisationId') organisationId: number,
	): Promise<{ id: number, name: string, logoUrl: string }[]> {
		return await this.applicationService.findAllApplicationsInOrganisationByOrganisationId(organisationId);
	}


	/**
	 * Retrieves the access rights of the currently connected user in a specific organisation.
	 *
	 * @param {Request} request - The HTTP request object containing the user's session or authentication details.
	 * @param {number} organisationId - The unique identifier of the organisation to check for access rights.
	 * @return {Promise<OrganisationAccessRightEntity>} A promise that resolves to the access rights of the user in the specified organisation.
	 */
	@Get(':organisationId/accessRights')
	async getAccessRightsOfCurrentUserInOrganisation(
		@Req() request: Request,
		@Param('organisationId') organisationId: number
	) {
		const user = await this.userService.findCurrentlyConnectedUser(request);
		const organisation = await this.organisationService.findOne(organisationId);
		return await this.organisationService.findAccessRightsOfUserInOrganisation(user, organisation)
	}

	@Get(':organisationId/accessRights/:publicKey')
	async getAccessRightsOfUserInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('publicKey') publicKey: string
	) {
		const user = await this.userService.findOneByPublicKey(publicKey);
		const organisation = await this.organisationService.findOne(organisationId);
		return await this.organisationService.findAccessRightsOfUserInOrganisation(user, organisation)
	}

	/**
	 * Returns the list of organisation in which the current user is involved
	 *
	 */
	@Get(":organisationId/application/:applicationId")
	async getApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	) {
		const application = await this.applicationService.findApplication(applicationId);
		return instanceToPlain(application);
	}


	@Get(':organisationId/user')
	async getOrganisationUsersById(
		@Param('organisationId') organisationId: number,
	): Promise<UserEntity[]> {
		return  this.organisationService.findAllUsersInOrganisation(organisationId);
	}




	@Get(':organisationId')
	async getOrganisationById(
		@Param('organisationId') organisationId: number,
	): Promise<OrganisationEntity> {
		return await this.organisationService.findOne(organisationId);
	}

	@Get(':organisationId/user/:userPublicKey')
	async getUserInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('userPublicKey') userPublicKey: string,
	): Promise<UserEntity> {
		return await this.userService.findUserInOrganisation(userPublicKey, organisationId);
	}





	@Get(':organisationId/stats')
	async getStatistics(@Param('organisationId') organisationId: number) {
		const applicationsNumber =  await this.organisationService.getNumberOfApplicationsInOrganisation(organisationId);
		const usersNumber = await this.organisationService.getNumberOfUsersInOrganisation(organisationId);
		const oraclesNumber = await this.oracleService.getNumberOfOraclesInOrganisation(organisationId);
		return {
			oraclesNumber,
			applicationsNumber,
			usersNumber,
		}
	}


	@Get(':organisationId/logs')
	async getLogsOfOrganisation(@Param('organisationId') organisationId: number) {
		return this.auditService.getLogsByOrganisation(organisationId);
	}

	@Get(':organisationId/countUsers')
	async countUsers(@Param('organisationId') organisationId: number) {
		return this.organisationService.countUsers(organisationId)
	}








	/**
	 * Retrieve all Oracles associated with a specific organisation
	 * @param organisationId ID of the organisation
	 * @returns List of Oracle entities
	 */
	@Get(':organisationId/oracle')
	async getAllOraclesInOrganisation(@Param('organisationId') organisationId: number): Promise<OracleEntity[]> {
		return this.oracleService.getAllOraclesInOrganisation(organisationId);
	}

	/**
	 * Retrieve a specific Oracle by its ID
	 * @param organisationId ID of the organisation
	 * @param oracleId ID of the Oracle
	 * @returns The requested Oracle entity
	 */
	@Get(':organisationId/oracle/:oracleId')
	async getOracle(@Param('organisationId') organisationId: number, @Param('oracleId') oracleId: number): Promise<OracleEntity> {
		const oracle = await this.oracleService.getOracleById(oracleId);
		if (!oracle) throw new NotFoundException('Oracle not found');
		return oracle;
	}






	/**
	 * Search for users, oracles and applications by name
	 *
	 * @param organisationId
	 * @param query
	 */
	@Get(':organisationId/search')
	async search(
		@Param('organisationId') organisationId: number,
		@Query('query') query: string
	) {
		// ignore empty query
		if ( query === '' ) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		}


		// search users by name
		const foundUsers = await this.userService.search(query);

		// search oracles by name
		const foundOracles = await this.oracleService.search(organisationId, query);

		// search applications by name
		const foundApplications = await this.applicationService.search(organisationId, query);

		return {
			'users': foundUsers,
			'oracles': foundOracles,
			'applications': foundApplications,
		}
	}

	@Get(":organisationId/publicationCost")
	async getOrganisationPublicationCost(
		@Param('organisationId') organisationId: number,
	) {
		return await this.organisationService.getPublicationCost(organisationId);
	}

	@Get(":organisationId/checkPublishedOnChain")
	async checkPublishedOnChain(
		@Param('organisationId') organisationId: number,
	) {
		const organisation = await this.organisationService.findOne(organisationId);
		if (organisation.virtualBlockchainId === undefined) return { published: false }
		const published = await this.chainService.checkPublishedOnChain(organisation);
		return { published }
	}





	@Get(":organisationId/application/:applicationId/publicationCost")
	async getApplicationPublicationCost(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	) {
		return await this.applicationService.getPublicationCost(applicationId);
	}


	@Get(':organisationId/transactionsHistory')
	async getTransactionsHistory(
		@Param('organisationId') organisationId: number,
		@Query('limit') limit: string,
		@Query('fromHistoryHash') fromHistoryHash : string | undefined,
	) {
		const {publicSignatureKey} = await this.organisationService.findPublicKeyById(organisationId);
		return await this.chainService.getTransactionsHistory(publicSignatureKey, fromHistoryHash, parseInt(limit))
	}

	@Get(':organisationId/hasTokenAccount')
	async checkAccountExistence(
		@Param('organisationId') organisationId: number
	) {
		const {publicSignatureKey} = await this.organisationService.findPublicKeyById(organisationId);
		const hasTokenAccount = await this.chainService.checkAccountExistence(publicSignatureKey)
		return {hasTokenAccount}
	}

	@Get(':organisationId/balance')
	async getBalanceOfOrganisation(
		@Param('organisationId') organisationId: number
	) {
		const {publicSignatureKey} = await this.organisationService.findPublicKeyById(organisationId);
		const balance = await this.chainService.getBalanceOfAccount(publicSignatureKey)
		return {balance}
	}



	/**
	 * Publishes the specified organisation on the blockchain.
	 *
	 * This function uses the `publishOrganisation` method from the `organisationService`
	 * to publish an organisation. It is guarded by the `IsAdminInOrganisation` guard,
	 * ensuring that only users with admin privileges in the organisation can perform the operation.
	 *
	 * @param organisationId - The unique identifier of the organisation to be published.
	 * @throws HttpException if the publishing process encounters an issue.
	 */
	@UseGuards(IsAdminInOrganisation)
	@Post(":organisationId/publish")
	async publishOrganisation(
		@Param('organisationId') organisationId: number,
	) {
		await this.organisationService.publishOrganisation(organisationId);
	}


	@UseGuards(IsAdminInOrganisation)
	@Put(":organisationId/erasePublication")
	async erasePublication(@Param('organisationId') organisationId: number) {
		const organisation: OrganisationEntity = await this.organisationService.findOne( organisationId );
		await this.organisationService.erasePublicationInformation(organisation);
	}

	/**
	 * Update an organisation
	 *
	 */
	@UseGuards(IsAdminInOrganisation)
	@Put(':organisationId')
	async updateOrganisation(
		@Param('organisationId') organisationId: number,
		@Body() organisationDto: UpdateOrganisationDto,
	): Promise<OrganisationEntity> {
		// create an organisation entity from the input DTO
		const organisation: OrganisationEntity = plainToInstance(OrganisationEntity, organisationDto);
		organisation.isDraft = true;
		const success = await this.organisationService.update(organisationId, organisation);

		if (success) {
			this.auditService.log(
				EntityType.ORGANISATION,
				organisationId,
				AuditOperation.ORGANISATION_EDITION,
				{ name: organisation.name },
			);
		}

		return organisation;
	}


	/**
	 * Deletes an organisation by its ID.
	 *
	 * @param {number} organisationId - The ID of the organisation to be deleted.
	 * @return {Promise<{ message: string }>} - A promise that resolves to a success message.
	 */
	@UseGuards(IsAdminInOrganisation)
	@Delete(':organisationId')
	async deleteOrganisation(
		@Param('organisationId') organisationId: number,
	): Promise<{ message: string }> {
		await this.organisationService.deleteOrganisationById(organisationId);
		return { message: 'Organisation deleted successfully.' };
	}



}
