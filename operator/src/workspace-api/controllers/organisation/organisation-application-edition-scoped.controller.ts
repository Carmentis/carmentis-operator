import {
	BadRequestException,
	Body, ClassSerializerInterceptor,
	Controller,
	Delete,
	ForbiddenException, Get,
	HttpException,
	HttpStatus,
	Logger,
	Param,
	Post,
	Put,
	UseGuards, UseInterceptors,
} from '@nestjs/common';
import { UserInOrganisationGuard } from '../../guards/user-in-organisation.guard';
import { CanEditApplications, IsAdminInOrganisation } from '../../guards/user-has-valid-access-right.guard';
import { OrganisationService } from '../../../shared/services/organisation.service';
import { ApplicationService } from '../../../shared/services/application.service';
import { AuditService } from '../../../shared/services/audit.service';
import { ApplicationEntity } from '../../../shared/entities/application.entity';
import { AuditOperation, EntityType } from '../../../shared/entities/audit-log.entity';
import { ApplicationDto } from '../../dto/application.dto';
import { plainToInstance } from 'class-transformer';
import { EnvService } from '../../../shared/services/env.service';
import { ApiKeyCreationDto } from '../../dto/api-key-creation.dto';
import { ApiKeyService } from '../../../shared/services/api-key.service';

@UseGuards(UserInOrganisationGuard, CanEditApplications)
@Controller('/workspace/api/organisation')
export class OrganisationApplicationEditionScopedController {

	private readonly logger = new Logger(OrganisationApplicationEditionScopedController.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
		private readonly auditService: AuditService,
		private readonly apiKeyService: ApiKeyService,
	) {}


	@UseInterceptors(ClassSerializerInterceptor)
	@Get('/apiKeys')
	async getAllKeys(@Param("applicationId") applicationId: number) {
		const application = await this.applicationService.findApplication(applicationId);
		return this.apiKeyService.findAllKeysByApplication(application)
	}


	@Post('/apiKeys')
	async createKey(
		@Body() body: ApiKeyCreationDto,
		@Param("applicationId") applicationId: number,
	) {
		const application = await this.applicationService.findApplication(applicationId);
		const activeUntil = new Date(body.activeUntil);
		const key = await this.apiKeyService.createKey(application, {
			name: body.name,
			activeUntil,
		})
		this.logger.log(`API Key '${body.name}' created`)
		return key;
	}

	@UseGuards(IsAdminInOrganisation)
	@Post(":organisationId/application/:applicationId/publish")
	async publishApplication(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	) {
		// reject the publication of an application if the organisation is not published itself
		const organisationIsPublished = await this.organisationService.isPublished(organisationId);
		if (!organisationIsPublished) throw new ForbiddenException("Publish first the organisation before to publish an application.")

		try {
			await this.applicationService.publishApplication(applicationId);
		} catch (e) {
			throw new BadRequestException(e);
		}
	}

	/**
	 * Update an application
	 *
	 */
	@Put(":organisationId/application/:applicationId")
	async updateApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
		@Body() applicationDto: ApplicationDto
	) {
		// create an application entity from the input DTO
		const application: ApplicationEntity = plainToInstance(ApplicationEntity, applicationDto);
		application.isDraft = true;
		const success = await this.applicationService.update(application);
		if ( success ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_EDITION,
				{ name: application.name }
			)
		}
	}

	@Post(':organisationId/application')
	async createApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Body('applicationName') name: string,
	): Promise<ApplicationEntity> {
		const organisation = await this.organisationService.findOne(organisationId);
		if ( !organisation ) {
			throw new HttpException('Organisation not found', HttpStatus.NOT_FOUND);
		}
		const result = this.applicationService.createApplicationInOrganisationByName(
			organisation,
			name
		);

		if ( result ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_CREATION,
				{ name: name }
			)
		}


		return result;
	}

	@Delete(':organisationId/application/:applicationId')
	async deleteApplicationInOrganisation(
		@Param('organisationId') organisationId: number,
		@Param('applicationId') applicationId: number,
	): Promise<ApplicationEntity> {
		const deletedApplication = await this.applicationService.deleteApplicationById(applicationId);
		if ( deletedApplication ) {
			this.auditService.log(
				EntityType.APPLICATION,
				organisationId,
				AuditOperation.APPLICATION_DELETION,
				{ name: deletedApplication.name }
			)
		}

		return deletedApplication;
	}

}